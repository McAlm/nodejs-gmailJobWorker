const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const base64url = require('base64url');

// If modifying these scopes, delete token.json.
const SCOPES = [//'https://www.googleapis.com/auth/gmail.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

console.log(TOKEN_PATH);
console.log(CREDENTIALS_PATH);

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fsp.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fsp.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fsp.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  console.log('Authorizing ...');
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });
}

async function sendMail(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: 'Hello World!'
    }
  });
  console.log(res);
}

async function sendCalendar(auth, email, postalAddress) {
  console.log("Sending calendar");

  var eventBase64 = fs.readFileSync(path.join(__dirname, 'event.ics')).toString('base64');

  var body = [
  "To: " + email +"\r\n",
  "Subject: Ihre Dienstreise wurde genehmigt\r\n",
  "Content-Type: multipart/mixed; boundary=\"foo_bar\"\r\n",
  "\r\n",

  "--foo_bar\r\n",
  "Content-Type: text/html; charset=\"utf-8\"\r\n",
  "MIME-Version: 1.0\r\n",
  "Content-Transfer-Encoding: quoted-printable\r\n",
  "Content-Disposition: inline\r\n",
  "\r\n",
  
  "Viel Erfolg bei Ihrer Dienstreise nach <b>" + postalAddress.locality + ".</b>\r\n",
  "\r\n",

  "--foo_bar\r\n",
  "Content-Type: text/calendar\r\n",
  "MIME-Version: 1.0\r\n",
  "Content-Transfer-Encoding: base64\r\n",
  "Content-Disposition: attachment; filename='event.ics'\r\n",
  eventBase64 + "\r\n",
  "\r\n",
  "--foo_bar--"].join('');
  
  console.log("###############################")
  console.log(body);
  console.log("###############################")


  var mail = base64url.encode(body, "utf8");

  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: mail
    }
  });
  console.log(res);
}


//authorize().then(listLabels).catch(console.error);
exports.authorize = authorize;
exports.sendCalendar = sendCalendar;