import { ReqoreModal } from '@qoretechnologies/reqore';
import { IReqoreModalProps } from '@qoretechnologies/reqore/dist/components/Modal';

export interface ICustomDialogProps extends IReqoreModalProps {
  children: any;
}

const CustomDialog = ({ children, ...rest }: ICustomDialogProps) => {
  //const dialogContext = useContext(DialogsContext);

  // useEffectOnce(() => {
  //     const id = shortid.generate();

  //     dialogContext.addDialog(id, rest.onClose);
  //     // Remove the dialog when unmounted
  //     return () => {
  //         dialogContext.removeDialog(id);
  //     };
  // });

  return (
    <ReqoreModal {...rest} label={rest.title} blur={5}>
      {children}
    </ReqoreModal>
  );
};

export default CustomDialog;
