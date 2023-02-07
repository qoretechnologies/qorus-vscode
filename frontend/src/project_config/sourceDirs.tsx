import { ReqoreMessage, ReqorePanel, ReqoreTag, ReqoreTagGroup } from '@qoretechnologies/reqore';
import size from 'lodash/size';
import { FunctionComponent, useContext, useState } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { TTranslator } from '../App';
import CustomDialog from '../components/CustomDialog';
import TreeField from '../components/Field/tree';
import Loader from '../components/Loader';
import { Messages } from '../constants/messages';
import { InitialContext } from '../context/init';
import { TextContext } from '../context/text';
import { addMessageListener, postMessage } from '../hocomponents/withMessageHandler';
import { IProjectData } from './ProjectConfig';

export interface ISourceDirectoriesProps {
  onClose?: () => void;
  isOpen?: boolean;
  flat?: boolean;
}

const SourceDirectories: FunctionComponent<ISourceDirectoriesProps> = ({
  onClose,
  isOpen,
  flat,
}) => {
  const [projectData, setProjectData] = useState<IProjectData>(null);
  const initContext = useContext(InitialContext);
  const t: TTranslator = useContext(TextContext);

  useEffectOnce(() => {
    // Update the source dirs on message
    addMessageListener(Messages.CONFIG_RETURN_DATA, ({ data }) => {
      setProjectData(data);
    });
    // Get the config data, so we can get the
    // source directories
    postMessage(Messages.CONFIG_GET_DATA);
  });

  const handleAddDirectory: (dirs: string) => void = (dirs) => {
    // Filter the deleted instance
    setProjectData((current: IProjectData): IProjectData => {
      // Create new instance
      const newData: IProjectData = { ...current };
      // Add new directory
      newData.source_directories = [...dirs];
      // Update backend data
      postMessage(Messages.CONFIG_UPDATE_DATA, {
        data: newData,
      });
      // Update local state
      return newData;
    });
  };

  const handleDeleteDirectory: (name: string) => void = (name) => {
    // Filter the deleted instance
    setProjectData((current: IProjectData): IProjectData => {
      // Create new instance
      const newData: IProjectData = { ...current };
      // Remove directory
      newData.source_directories = newData.source_directories.filter((dir) => dir !== name);
      // Update backend data
      // Update the data on the backend
      postMessage(Messages.CONFIG_UPDATE_DATA, {
        data: newData,
      });
      // Update local state
      return newData;
    });
  };

  const renderSourceDirs = () =>
    !projectData?.source_directories ? (
      <Loader text="Loading..." />
    ) : (
      <>
        <ReqorePanel label={t('MyDirectories')} flat minimal transparent>
          {size(projectData.source_directories) ? (
            <ReqoreTagGroup>
              {projectData.source_directories.map((dir) => (
                <ReqoreTag
                  key={dir}
                  fluid
                  icon="Folder2Line"
                  label={dir}
                  actions={[
                    {
                      icon: 'DeleteBinLine',
                      intent: 'danger',
                      onClick: () => {
                        initContext?.confirmAction(
                          'ConfirmRemoveSourceDir',
                          () => handleDeleteDirectory(dir),
                          undefined,
                          undefined,
                          undefined,
                          'danger'
                        );
                      },
                    },
                  ]}
                />
              ))}
            </ReqoreTagGroup>
          ) : (
            <ReqoreMessage icon="ForbidLine">{t('NoDirectories')}</ReqoreMessage>
          )}
        </ReqorePanel>
        <ReqorePanel label={t('AddSourceDirectory')} minimal transparent flat>
          <TreeField
            onChange={(_name, value) => handleAddDirectory(value.map((path) => path.name || path))}
            value={projectData.source_directories.map((dir) => ({ name: dir }))}
            useRelativePath
            name="source-dirs"
            get_message={{
              action: Messages.GET_PROJECT_DIRS,
            }}
            return_message={{
              action: Messages.RETURN_PROJECT_DIRS,
              return_value: 'directories',
            }}
            onFolderCreated={() => {
              postMessage(Messages.CONFIG_GET_DATA);
            }}
            notFixed
          />
        </ReqorePanel>
      </>
    );

  if (flat) {
    return <div>{renderSourceDirs()}</div>;
  }

  return (
    <CustomDialog
      isOpen={isOpen}
      icon="FolderLine"
      onClose={onClose}
      title={t('ManageSourceDirectories')}
    >
      {renderSourceDirs()}
    </CustomDialog>
  );
};

export default SourceDirectories;
