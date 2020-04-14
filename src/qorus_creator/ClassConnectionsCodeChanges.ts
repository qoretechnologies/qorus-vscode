import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import * as msg from '../qorus_message';

export const classConnectionsCodeChanges = (file, code_info: QorusProjectCodeInfo, data, orig_data) => {
    msg.debug({file, data, orig_data});
    code_info.addFileCodeInfo(file, orig_data);
}
