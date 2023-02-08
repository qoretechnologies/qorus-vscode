import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreHorizontalSpacer,
  ReqoreMessage,
  ReqorePanel,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { size } from 'lodash';
import { FunctionComponent, useContext, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import styled, { css } from 'styled-components';
import Field from '.';
import { TTranslator } from '../../App';
import { ContentWrapper, IField, IFieldChange } from '../../components/FieldWrapper';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { validateField } from '../../helpers/validations';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
  addMessageListener,
  postMessage,
} from '../../hocomponents/withMessageHandler';
import SourceDirs from '../../project_config/sourceDirs';
import CustomDialog from '../CustomDialog';
import { FieldWrapper } from '../FieldWrapper';
import { PositiveColorEffect } from './multiPair';

export interface ITreeField {
  get_message: { action: string; object_type: string };
  return_message: { action: string; object_type: string; return_value: string };
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  name: string;
  t: TTranslator;
  single?: boolean;
  useRelativePath?: boolean;
  notFixed?: boolean;
}

const StyledTreeWrapper = styled.div`
  min-height: 30px;
  line-height: 30px;
  padding: 7px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 3px;
  border: 1px solid #bac4d3;

  transition: all 0.2s;
  .bp3-icon {
    color: #5c7080;
    margin-right: 5px;
  }
  &:hover {
    background-color: #dfe7f3;
  }
`;

const StyledTreeScroller = styled.div`
  max-height: 400px;
  overflow: auto;
`;

const StyledTreeValue = styled.p`
  color: #efefef;
  border-radius: 3px;
  padding: 5px;
  line-height: 20px;
  background-color: #5c7080;

  ${({ empty }) =>
    empty &&
    css`
      background-color: #ffcaca;
      border: 1px solid #ff8282;
      color: #222;
    `}
`;

const TreeField: FunctionComponent<ITreeField & IField & IFieldChange & any> = ({
  get_message,
  return_message,
  onChange,
  name,
  value = [],
  default_value,
  single,
  useRelativePath,
  notFixed,
  onFolderCreated,
  canManageSourceDirs,
}) => {
  const t = useContext(TextContext);
  const { callBackend } = useContext(InitialContext);
  const [isRootExpanded, setRootExpanded] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [items, setItems] = useState<any>([]);
  const [folderDialog, setFolderDialog] = useState<any>(undefined);
  const [manageSourceDirs, setManageSourceDirs] = useState<any>(false);

  useMount(() => {
    if (default_value) {
      onChange(name, default_value);
    }

    addMessageListener(return_message.action, (data: any) => {
      // Check if this is the correct
      // object type
      if (!data.object_type || data.object_type === return_message.object_type) {
        setItems(data[return_message.return_value]);
      }
    });
    postMessage(get_message.action, { object_type: get_message.object_type });
  });

  const handleNodeClick: (node: any) => void = (node) => {
    // Which path should be used
    const usedPath: string = useRelativePath ? node.nodeData.rel_path : node.nodeData.path;
    // If we are dealing with single string
    if (single) {
      onChange(name, usedPath);
    } else {
      // Multiple files can be selected
      if (value.find((sel) => sel.name === usedPath)) {
        // Remove the selected item
        onChange(
          name,
          value.filter((path) => path.name !== usedPath)
        );
      } else {
        onChange(name, [...value, { name: usedPath }]);
      }
    }
  };

  const handleNodeCollapse: (node: any) => void = (node) => {
    // Which path should be used
    const usedPath: string = useRelativePath ? node.nodeData.rel_path : node.nodeData.path;

    setExpanded((currentExpanded: string[]): string[] =>
      currentExpanded.filter((path: string) => path !== usedPath)
    );
  };

  const handleNodeExpand: (node: any) => void = (node) => {
    // Which path should be used
    const usedPath: string = useRelativePath ? node.nodeData.rel_path : node.nodeData.path;

    setExpanded((currentExpanded: string[]): string[] => [...currentExpanded, usedPath]);
  };

  const handleCreateDirSubmit = async (addSource?: boolean) => {
    console.log(folderDialog);
    setFolderDialog({ ...folderDialog, loading: true });

    const data = await callBackend('create-directory', undefined, {
      path: `${folderDialog.abs_path}${
        folderDialog.newPath.startsWith('/') ? folderDialog.newPath : `/${folderDialog.newPath}`
      }`,
      add_source: addSource,
    });

    if (data.ok) {
      setFolderDialog(undefined);
      postMessage(get_message.action, { object_type: get_message.object_type });
      if (onFolderCreated) {
        onFolderCreated();
      }
    } else {
      setFolderDialog((cur) => ({
        ...cur,
        loading: false,
        error: data.message,
      }));
    }
  };

  const transformItems: (data: any[]) => any[] = (data) => {
    const result = data.reduce((newData, item, index): any[] => {
      // Recursively build the child nodes (folders and files)
      const childNodes: any[] | undefined =
        size(item.dirs) + size(item.files)
          ? transformItems([...item.dirs, ...(item.files || [])])
          : undefined;
      // Check if this item is a file
      const isFile: boolean = !('dirs' in item) && !('files' in item);
      // Build the absolute path
      const path: string = isFile
        ? `${useRelativePath ? item.rel_path : item.abs_path}/${item.name}`
        : useRelativePath
        ? item.rel_path
        : item.abs_path;
      const isExpanded = expanded.includes(useRelativePath ? item.rel_path : item.abs_path);
      // Return the transformed data
      return [
        ...newData,
        {
          ...item,
          id: index,
          depth: index,
          hasCaret: !isFile && size(item.dirs) + size(item.files) !== 0,
          isSelected: single ? value === path : value.find((sel) => sel.name === path),
          icon: isFile ? 'document' : isExpanded ? 'folder-open' : 'folder-close',
          isExpanded,
          label: item.basename,
          childNodes,
          nodeData: {
            path,
            rel_path: item.rel_path,
          },
        },
      ];
    }, []);

    return result;
  };

  const renderFolders = (data) => (
    <ReqoreControlGroup vertical fluid>
      {data.map((item) => (
        <>
          <ReqoreControlGroup>
            {size(item.childNodes) ? (
              <ReqoreButton
                fixed
                onClick={() =>
                  !item.isExpanded ? handleNodeExpand(item) : handleNodeCollapse(item)
                }
                minimal
                flat
                iconColor={item.isExpanded ? 'info:lighten:2' : undefined}
                icon={item.isExpanded ? 'ArrowDownSLine' : 'ArrowRightSLine'}
              />
            ) : (
              <ReqoreButton readOnly fixed minimal flat icon="ForbidLine" />
            )}
            <ReqoreButton
              onClick={() => handleNodeClick(item)}
              active={item.isSelected}
              flat={!item.isSelected}
              iconColor={item.isExpanded ? 'info:lighten:2' : undefined}
              icon={item.isExpanded ? 'FolderOpenLine' : 'FolderLine'}
              rightIcon={item.isSelected ? 'CheckLine' : undefined}
              effect={
                item.isSelected
                  ? {
                      gradient: {
                        colors: {
                          0: 'main',
                          160: 'info:lighten',
                        },
                      },
                    }
                  : undefined
              }
            >
              {item.label}
            </ReqoreButton>
            <ReqoreButton
              fixed
              effect={PositiveColorEffect}
              icon="FolderAddFill"
              onClick={() => setFolderDialog({ ...item, newPath: '' })}
            />
          </ReqoreControlGroup>
          {item.childNodes && item.isExpanded ? (
            <ReqoreControlGroup>
              <ReqoreHorizontalSpacer width={20} />
              {renderFolders(item.childNodes)}
            </ReqoreControlGroup>
          ) : null}
        </>
      ))}
    </ReqoreControlGroup>
  );

  return (
    <>
      {folderDialog && (
        <CustomDialog
          icon="FolderAddLine"
          isOpen
          label={t('CreateNewDir')}
          onClose={() => {
            setFolderDialog(undefined);
          }}
          bottomActions={[
            {
              label: t('CreateFolder'),
              disabled: folderDialog.loading || !validateField('string', folderDialog.newPath),
              icon: 'CheckLine',
              intent: 'success',
              onClick: () => handleCreateDirSubmit(),
              position: 'right',
            },
            {
              label: t('CreateFolderAndAddSource'),
              disabled: folderDialog.loading || !validateField('string', folderDialog.newPath),
              icon: 'CheckDoubleLine',
              intent: 'success',
              onClick: () => handleCreateDirSubmit(true),
              position: 'right',
            },
          ]}
        >
          <ReqoreMessage intent="info" size="small">
            {t('AddingNewDirectoryTo')} <strong>{folderDialog.abs_path}</strong>.{' '}
            {t('MultipleSubdirectoriesNewDir')}
          </ReqoreMessage>
          <ReqoreVerticalSpacer height={10} />
          {folderDialog.error && (
            <ReqoreMessage intent="danger">{folderDialog.error}</ReqoreMessage>
          )}
          <ContentWrapper>
            <FieldWrapper
              compact
              label={t('field-label-newDir')}
              isValid={validateField('string', folderDialog.newPath)}
            >
              <Field
                type="string"
                value={folderDialog.newPath}
                onChange={(_name, value) => setFolderDialog((cur) => ({ ...cur, newPath: value }))}
                name="new-directory"
              />
            </FieldWrapper>
          </ContentWrapper>
        </CustomDialog>
      )}
      {manageSourceDirs && (
        <SourceDirs
          isOpen
          onClose={() => {
            setManageSourceDirs(false);
            postMessage(get_message.action, { object_type: get_message.object_type });
          }}
        />
      )}
      {single && value ? (
        <>
          <ReqoreMessage intent={!size(value) ? 'warning' : 'info'} size="small">
            {!size(value) ? t('ValueIsEmpty') : value}
          </ReqoreMessage>
          <ReqoreVerticalSpacer height={10} />
        </>
      ) : null}
      <ReqorePanel
        label="Source Directories"
        collapsible
        isCollapsed={true}
        icon="FolderAddLine"
        fluid
        size="small"
        minimal
        actions={[
          {
            icon: 'Settings3Fill',
            onClick: () => setManageSourceDirs(true),
            tooltip: 'Manage source directories',
            show: canManageSourceDirs === true,
          },
        ]}
      >
        <StyledTreeScroller>{renderFolders(transformItems(items))}</StyledTreeScroller>
      </ReqorePanel>
    </>
  );
};

export default withMessageHandler()(TreeField);
