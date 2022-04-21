import * as request from 'request-promise';
import { t } from 'ttag';
import * as urlJoin from 'url-join';
import * as vscode from 'vscode';
import { QorusLogin } from './QorusLogin';
import { qorus_webview } from './QorusWebview';
import * as msg from './qorus_message';

export interface QorusRequestTexts {
  error: string;
  running: string;
  cancelling: string;
  cancellation_failed: string;
  checking_progress: string;
  finished_successfully: string;
  cancelled: string;
  failed: string;
  checking_status_failed: string;
}

const log_request_messages = false;

export class QorusRequest extends QorusLogin {
  // onFinished is executed unconditionally; even if there are errors
  // returns true if the process got to the stage of checking the result
  // returns false if the process failed earlier
  doRequestAndCheckResult(options: any, texts: QorusRequestTexts, onFinished?): Thenable<boolean> {
    return request(options).then(
      (response: any) => {
        console.log('Request response: ' + JSON.stringify(response));
        msg.log('    ' + t`requestResponse ${JSON.stringify(response)}`);
        if (response.id === undefined) {
          msg.error(t`ResponseIdUndefined`);
          return false;
        }
        this.checkRequestResult(options.uri, response.id.toString(), texts, onFinished);
        return true;
      },
      (error: any) => {
        console.log('Request error: ' + JSON.stringify(error));
        this.requestError(error, texts.error);
        if (onFinished) {
          onFinished();
        }
        return false;
      }
    );
  }

  private checkRequestResult = (
    url: string,
    request_id: string,
    texts: QorusRequestTexts,
    onFinished?
  ) => {
    const id_info = t`RequestIdInfo ${request_id}`;

    const token: string | undefined = this.getToken();

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: texts.running + id_info,
        cancellable: true,
      },
      async (progress, cancel_token): Promise<void> => {
        cancel_token.onCancellationRequested(() => {
          msg.info(texts.cancelling + id_info);

          const options = {
            method: 'DELETE',
            uri: urlJoin(url, request_id),
            strictSSL: false,
            headers: {
              'qorus-token': token,
            },
            json: true,
          };
          request(options).catch((error) => {
            msg.error(texts.cancellation_failed + id_info);
            msg.log(JSON.stringify(error));
          });
          msg.log(t`CancellationRequestSent ${request_id}`);
        });

        progress.report({ increment: -1 });
        let sec = 0;
        let quit = false;

        const options = {
          method: 'GET',
          uri: urlJoin(url, request_id),
          strictSSL: false,
          headers: {
            'qorus-token': token,
          },
          json: true,
        };

        msg.log('uri ' + options.uri);

        while (!quit) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // sleep(1s)
          msg.log(t`seconds ${++sec}` + '   ' + texts.checking_progress + id_info + ' ... ');

          await request(options).then(
            (response: any) => {
              const status: string = response.status;
              if (response.stdout) {
                msg.log('    ' + t`requestResponse ${response.stdout}`);
                msg.log('    ' + t`requestStatus ${status}`);
              }
              if (response.stderr) {
                msg.log('    ' + t`requestResponse ${response.stderr}`);
                msg.log('    ' + t`requestStatus ${status}`);
              }
              switch (status) {
                case 'FINISHED':
                  msg.info(texts.finished_successfully + id_info);
                  quit = true;
                  break;
                case 'CANCELED':
                case 'CANCELLED':
                  msg.info(texts.cancelled + id_info);
                  quit = true;
                  break;
                case 'FAILED':
                  msg.log(texts.failed + id_info);

                  vscode.window
                    .showErrorMessage(
                      texts.failed + id_info + '.  ' + t`YouCanOpenQorusLog`,
                      t`OpenQorusLogButton`
                    )
                    .then(() => {
                      msg.output.show();
                    });

                  quit = true;
                  break;
                default:
              }
            },
            (error: any) => {
              this.requestError(error, texts.checking_status_failed + id_info);
              quit = true;
            }
          );
        }
        if (onFinished) {
          onFinished();
        }
      }
    );
  };

  doRequest = (
    url: string,
    method: string,
    onSuccess: Function,
    onError?: Function,
    id?: string,
    body?: { [key: string]: any }
  ) => {
    const { ok, active_instance, token } = this.activeQorusInstanceAndToken();
    if (!ok) {
      msg.error(t`UnableGetActiveQorusInstanceData`);
      if (onError) {
        onError();
      }
      return;
    }

    const uri = urlJoin(active_instance.url, 'api/latest', url);
    if (log_request_messages) {
      msg.log(t`SendingRequest ${id} ${uri}`);
    }

    let requestOptions = {
      method,
      uri,
      strictSSL: false,
      headers: {
        'qorus-token': token,
      },
    };

    if (method !== 'GET') {
      // @ts-ignore
      requestOptions = { ...requestOptions, body: body || {}, json: true };
    }

    request(requestOptions).then(
      (response) => {
        if (log_request_messages) {
          msg.log(t`GettingResponse ${id} ${JSON.stringify(JSON.parse(response), null, 4)}`);
        }
        console.log('SUCCESS', uri, response);
        onSuccess(method !== 'GET' ? JSON.stringify(response) : response);
      },
      (error) => {
        console.log('ERROR', uri);
        console.log(error);
        if (onError) {
          onError(error);
        }
      }
    );
  };

  fetchData = ({ id, method, url, body }) => {
    const onSuccess = (response) => {
      qorus_webview.postMessage({
        action: 'fetch-data-complete',
        id,
        data: typeof response === 'string' ? JSON.parse(response) : response,
      });
    };

    const onError = (error) => {
      msg.error(error);
      qorus_webview.postMessage({
        action: 'fetch-data-complete',
        id,
        error: error,
      });
    };

    this.doRequest(url, method, onSuccess, onError, id, body);
  };
}

export const qorus_request = new QorusRequest();
