import * as CryptoJS from 'crypto-js';
import * as fs from 'fs';
import * as path from 'path';
import * as urlParse from 'url-parse';
import * as urldecode from 'urldecode';
import * as urlencode from 'urlencode';
import { Range, Uri } from 'vscode';

export const isDeployable = (file_path: string): boolean =>
  hasOneOfSuffixes(file_path, [
    'qfd',
    'qwf',
    'qsd',
    'qjob',
    'qclass',
    'qconst',
    'qconn',
    'qstep',
    'qm',
    'qmapper',
    'qvmap',
    'qsm',
    'qrf',
    'qscript',
    'java',
    'yaml',
    'qmc',
    'qtest',
    'py',
    'java',
    'qsm',
  ]);

export const expectsYamlFile = (file_path: string): boolean =>
  hasOneOfSuffixes(file_path, [
    'qfd',
    'qwf',
    'qsd',
    'qjob',
    'qclass',
    'qstep',
    'qmc',
    'java',
    'py',
  ]);

export const hasSuffix = (file_path: string, suffix: string): boolean => {
  return hasOneOfSuffixes(file_path, [suffix]);
};

const hasOneOfSuffixes = (file_path: string, suffixes: string[]): boolean => {
  const suffix: string | undefined = getSuffix(file_path);
  return suffix ? suffixes.includes(suffix) : false;
};

export const isTest = (file_path: string): boolean => {
  const suffix: string | undefined = getSuffix(file_path);

  if (suffix === 'qtest') {
    return true;
  }
  if (suffix === 'java') {
    return path.basename(file_path, '.java').endsWith('Test');
  }
  if (suffix === 'py') {
    return path.basename(file_path, '.py').toLowerCase().endsWith('test');
  }

  return false;
};

export const isVersion3 = (version?: string): boolean =>
  !!version && version.toString().substr(0, 1) == '3';

const getSuffix = (file_path: string): string | undefined => file_path.split('.').pop();

export const suffixToIfaceKind = (suffix: string): string | undefined => {
  switch (suffix.split('.').pop()) {
    case 'qsd':
      return 'service';
    case 'qjob':
      return 'job';
    case 'qwf':
      return 'workflow';
    case 'qstep':
      return 'step';
    case 'qmc':
      return 'mapper-code';
    case 'qclass':
      return 'class';
    default:
      return undefined;
  }
};

export const hasConfigItems = (iface_kind) =>
  ['job', 'service', 'class', 'step'].includes(iface_kind);

// returns all files in the directory and its subdirectories satisfying filter condition (if provided)
// filter: function accepting a filename as an argument and returning a boolean value
export const filesInDir = (dir: string, filter?: Function): string[] => {
  let files = [];
  filesInDirImpl(dir, files, filter);
  return files;
};

const filesInDirImpl = (dir: string, files: string[], filter?: Function) => {
  const dir_entries: string[] = fs.readdirSync(dir);
  for (let entry of dir_entries) {
    const entry_path: string = path.join(dir, entry);
    if (fs.lstatSync(entry_path).isDirectory()) {
      filesInDirImpl(entry_path, files, filter);
    } else if (!filter || filter(entry_path)) {
      files.push(entry_path);
    }
  }
};

export const removeDuplicates = (values) => {
  let distinct_values = {};
  values.forEach((value) => (distinct_values[value] = true));
  return Object.keys(distinct_values);
};

export const dash2Camel = (str) => {
  let parts = str.split('-');
  const first = parts.splice(0, 1);
  parts = parts.map((part) => (part[0] || '').toUpperCase() + part.substr(1));
  return [first, ...parts].join('');
};

export const dash2Pascal = (str) =>
  str
    .split('-')
    .map((part) => (part[0] || '').toUpperCase() + part.substr(1))
    .join('');

export const toValidIdentifier = (str, capitalize = false) => {
  if (isValidIdentifier(str)) {
    return str;
  }

  let parts = str.trim().split(/\W+/);
  if (capitalize) {
    parts = parts.map((part) => (part[0] || '').toUpperCase() + part.substr(1));
  } else {
    const first = parts.splice(0, 1);
    parts = parts.map((part) => (part[0] || '').toUpperCase() + part.substr(1));
    parts = [first, ...parts];
  }

  return parts.join('').replace(/(^[0-9])/, '_' + '$1');
};

export const isValidIdentifier = (str) => !str.match(/^[0-9]|\W/);

export const makeFileUri = (filePath: string) => 'file://' + filePath;

export const getFilePathFromUri = (uri: string | Uri) =>
  typeof uri === 'string' ? uri.slice(7) : uri.fsPath;

export const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

export const capitalize = (str) => str[0].toUpperCase() + str.substr(1);

export const isObject = (obj: any): boolean =>
  obj && typeof obj === 'object' && !Array.isArray(obj);

export const compareVersion = (v1, v2) => {
  if (typeof v1 !== 'string' || typeof v2 !== 'string') {
    return undefined;
  }
  v1 = v1.split('.');
  v2 = v2.split('.');
  const min_len = Math.min(v1.length, v2.length);
  for (let i = 0; i < min_len; ++i) {
    v1[i] = parseInt(v1[i], 10);
    v2[i] = parseInt(v2[i], 10);
    if (v1[i] > v2[i]) {
      return 1;
    }
    if (v1[i] < v2[i]) {
      return -1;
    }
  }
  return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
};

export const sortRanges = (ranges: Range[]): Range[] =>
  ranges.sort((a, b) => {
    if (a.start.line < b.start.line) {
      return -1;
    }
    if (a.start.line > b.start.line) {
      return 1;
    }
    if (a.start.character < b.start.character) {
      return -1;
    }
    if (a.start.character > b.start.character) {
      return 1;
    }
    return 0;
  });

// modification: 'encrypt-pwd', 'decrypt-pwd', 'remove-user', 'remove-pwd'
// (actually, anything else works as 'remove-pwd')
export const modifyUrl = (orig_url: string, modification: string): string => {
  const crypto_key = 'jDYm&nr$8mh3K';
  const { protocol, slashes, host, query, pathname, username, password, hash } = urlParse(orig_url);

  let url = `${protocol}${slashes ? '//' : ''}`;

  if (username && modification !== 'remove-user') {
    url += `${username}`;
    if (password) {
      if (modification === 'encrypt-pwd') {
        url += `:${urlencode(CryptoJS.AES.encrypt(password, crypto_key).toString())}`;
      } else if (modification === 'decrypt-pwd') {
        url += `:${
          CryptoJS.AES.decrypt(urldecode(password), crypto_key).toString(CryptoJS.enc.Utf8) ||
          password
        }`;
      }
    }
    url += '@';
  }

  url += `${host}${pathname}${query}${hash}`;
  return url;
};
