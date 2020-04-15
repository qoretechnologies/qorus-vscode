import { QorusProjectEditInfo } from '../QorusProjectEditInfo';
import * as msg from '../qorus_message';

export const classConnectionsCodeChanges = (file, edit_info: QorusProjectEditInfo, data, orig_data) => {
    msg.debug({file, data, orig_data});
    edit_info.addFileInfo(file, orig_data);
}
