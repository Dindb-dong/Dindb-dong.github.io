const VISITS = '방문 기록';
const APPS = '앱 사용';
const CONTENT = '콘텐츠 열람';
const SUMMARY = '요약';

const VISIT_HEADERS = ['세션 ID', '방문 시각', '브라우저 ID', '방문 순번', '국가', '광역 지역',
  '유입 도메인', '캠페인', '기기', '첫 화면', '활성 체류(초)', '마지막 화면', '최근 갱신', '테스트'];
const APP_HEADERS = ['세션 ID', '첫 수동 실행 앱', 'portfolio', 'projects-portfolio', 'resume',
  'experience-leviosa', 'experience-alus', 'experience-yai', 'experience-noilab', 'experience-ycc',
  'experience-sdp', 'doom', 'nested-desktop', 'files', 'applications', 'terminal', 'activity-monitor',
  'text', 'browser', 'viewer', 'calculator', 'settings'];
const CONTENT_HEADERS = ['열람 ID', '세션 ID', '유형', '콘텐츠 ID', '콘텐츠 이름', '열람 횟수',
  '활성 열람(초)', '첫 열람', '열람 경로', 'GitHub 클릭', '외부·데모 링크 클릭', 'PDF 다운로드 클릭', '테스트'];

function setupAnalytics() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Run setup from the spreadsheet-bound script.');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheet.getId());
  spreadsheet.setSpreadsheetTimeZone('Asia/Seoul');
  [[VISITS, VISIT_HEADERS], [APPS, APP_HEADERS], [CONTENT, CONTENT_HEADERS]].forEach(([name, headers]) => {
    const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setBackground('#e8edf3').setFontWeight('bold').setWrap(true);
    sheet.setRowHeight(1, 34);
    sheet.setColumnWidths(1, headers.length, 125);
    sheet.setColumnWidth(1, 245);
    sheet.setFrozenRows(1);
  });
  spreadsheet.getSheetByName(VISITS).setColumnWidth(3, 245);
  spreadsheet.getSheetByName(CONTENT).setColumnWidth(2, 245).setColumnWidth(5, 240);
  const summary = spreadsheet.getSheetByName(SUMMARY) || spreadsheet.insertSheet(SUMMARY);
  summary.getRange('A1:B5').setValues([
    ['전체 기간', '값'],
    ['방문 세션', "=COUNTIF('방문 기록'!N2:N,FALSE)"],
    ['재방문 세션 비율', "=IFERROR(COUNTIFS('방문 기록'!D2:D,\">1\",'방문 기록'!N2:N,FALSE)/B2,0)"],
    ['이력서 열람률', "=IFERROR(COUNTIFS('콘텐츠 열람'!C2:C,\"resume\",'콘텐츠 열람'!M2:M,FALSE)/B2,0)"],
    ['PDF 다운로드 클릭률', "=IFERROR(COUNTIFS('콘텐츠 열람'!L2:L,\">0\",'콘텐츠 열람'!M2:M,FALSE)/B2,0)"],
  ]);
  summary.getRange('B3:B5').setNumberFormat('0.0%');
  summary.getRange('D1:F1').setValues([['프로젝트 ID', '열람 세션', '중앙 열람(초)']]);
  summary.getRange('D2').setFormula('=IFERROR(SORT(UNIQUE(FILTER(\'콘텐츠 열람\'!D2:D,\'콘텐츠 열람\'!C2:C="project",\'콘텐츠 열람\'!M2:M=FALSE))),"")');
  summary.getRange('E2').setFormula('=MAP(D2:D,LAMBDA(id,IF(id="","",COUNTIFS(\'콘텐츠 열람\'!D2:D,id,\'콘텐츠 열람\'!C2:C,"project",\'콘텐츠 열람\'!M2:M,FALSE))))');
  summary.getRange('F2').setFormula('=MAP(D2:D,LAMBDA(id,IF(id="","",MEDIAN(FILTER(\'콘텐츠 열람\'!G2:G,\'콘텐츠 열람\'!D2:D=id,\'콘텐츠 열람\'!C2:C="project",\'콘텐츠 열람\'!M2:M=FALSE)))))');
  summary.getRange('H1:J1').setValues([['유입처', '방문 세션', '이력서 열람률']]);
  summary.getRange('H2').setFormula('=IFERROR(SORT(UNIQUE(FILTER(\'방문 기록\'!G2:G,\'방문 기록\'!A2:A<>"",\'방문 기록\'!N2:N=FALSE))),"")');
  summary.getRange('I2').setFormula('=MAP(H2:H,LAMBDA(source,IF(source="","",COUNTIFS(\'방문 기록\'!G2:G,source,\'방문 기록\'!N2:N,FALSE))))');
  summary.getRange('J2').setFormula('=MAP(H2:H,I2:I,LAMBDA(source,visits,IF(source="","",IFERROR(SUMPRODUCT((\'방문 기록\'!G2:G=source)*(\'방문 기록\'!N2:N=FALSE)*ISNUMBER(MATCH(\'방문 기록\'!A2:A,IFERROR(FILTER(\'콘텐츠 열람\'!B2:B,\'콘텐츠 열람\'!C2:C="resume",\'콘텐츠 열람\'!M2:M=FALSE),""),0)))/visits,0))))');
  summary.getRange('J2:J').setNumberFormat('0.0%');
  summary.getRangeList(['A1:B1', 'D1:F1', 'H1:J1']).setBackground('#e8edf3').setFontWeight('bold');
  summary.setColumnWidths(1, 10, 145).setColumnWidth(1, 190).setColumnWidth(8, 200).setFrozenRows(1);
}

function doPost(event) {
  let locked = false;
  const lock = LockService.getScriptLock();
  try {
    const body = event && event.postData && event.postData.contents;
    if (!body || body.length > 55000) return response_(false);
    const data = JSON.parse(body);
    const id = data.sessionId;
    if (data.version !== 1 || !uuid_(id) || !uuid_(data.browserId) ||
        !Number.isSafeInteger(data.updated) || !Array.isArray(data.content) || data.content.length > 100 ||
        !data.apps || typeof data.apps !== 'object' || Array.isArray(data.apps)) return response_(false);
    locked = lock.tryLock(10000);
    if (!locked) return response_(false);
    const spreadsheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));
    const visits = spreadsheet.getSheetByName(VISITS);
    const existing = findRow_(visits, id);
    if (existing && Number(visits.getRange(existing, 13).getValue()) >= data.updated) return response_(true);
    const apps = spreadsheet.getSheetByName(APPS);
    const headers = apps.getRange(1, 1, 1, apps.getLastColumn()).getValues()[0];
    const newApps = Object.keys(data.apps).filter(key => /^[a-z][a-z0-9-]{0,45}$/.test(key) && !headers.includes(key));
    if (newApps.length && headers.length + newApps.length <= 80) {
      const capacity = apps.getMaxColumns();
      if (headers.length + newApps.length > capacity) apps.insertColumnsAfter(capacity, headers.length + newApps.length - capacity);
      apps.getRange(1, headers.length + 1, 1, newApps.length).setValues([newApps]).setBackground('#e8edf3').setFontWeight('bold').setWrap(true);
      headers.push(...newApps);
    }
    putRow_(apps, id, [id, cell_(data.firstApp), ...headers.slice(2).map(key => number_(data.apps[key]))]);
    const content = spreadsheet.getSheetByName(CONTENT);
    for (const item of data.content) {
      if (!item || !['project', 'experience', 'resume'].includes(item.type) ||
          typeof item.id !== 'string' || !/^[a-z0-9-]{1,60}$/.test(item.id)) continue;
      const key = [id, item.type, item.id].join(':');
      putRow_(content, key, [key, id, item.type, item.id, cell_(item.name), number_(item.views),
        seconds_(item.ms), date_(item.first), cell_(item.routes), number_(item.github),
        number_(item.external), number_(item.pdf), data.test === true]);
    }
    putRow_(visits, id, [id, date_(data.started), data.browserId, number_(data.ordinal), cell_(data.country),
      cell_(data.region), cell_(data.referrer), cell_(data.campaign), cell_(data.device), cell_(data.entry),
      seconds_(data.ms), cell_(data.last), data.updated, data.test === true], existing);
    SpreadsheetApp.flush();
    return response_(true);
  } catch (error) {
    console.error(String(error));
    return response_(false);
  } finally {
    if (locked) lock.releaseLock();
  }
}

function uuid_(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(value);
}

function cell_(value) {
  if (typeof value !== 'string') return '';
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 220);
  return /^[=+@'-]/.test(clean) ? "'" + clean : clean;
}

function number_(value) {
  return Number.isFinite(value) ? Math.min(100000000, Math.max(0, Math.floor(value))) : 0;
}

function seconds_(value) {
  return Math.round(number_(value) / 100) / 10;
}

function date_(value) {
  return Number.isSafeInteger(value) && value > 0 && value < 4102444800000
    ? Utilities.formatDate(new Date(value), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss') : '';
}

function findRow_(sheet, key) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const match = sheet.getRange(2, 1, last - 1, 1).createTextFinder(key).matchEntireCell(true).findNext();
  return match ? match.getRow() : 0;
}

function putRow_(sheet, key, row, existing = findRow_(sheet, key)) {
  if (existing) sheet.getRange(existing, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
}

function response_(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok })).setMimeType(ContentService.MimeType.JSON);
}
