import { ReqoreIcon, ReqoreP, ReqorePanel, ReqoreTextarea } from '@qoretechnologies/reqore';
import { IReqorePanelProps } from '@qoretechnologies/reqore/dist/components/Panel';
import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useUpdateEffect } from 'react-use';

export interface IEditableMesasgeProps extends Omit<IReqorePanelProps, 'children'> {
  content: string | number;
  onEdit: (label: string | number) => void;
  asMarkdown?: boolean;
}

export const EditableMessage = memo(
  ({ content, onEdit, asMarkdown, ...rest }: IEditableMesasgeProps) => {
    const [localContent, setLocalContent] = useState(content);
    const [isEditing, setIsEditing] = useState(false);

    useUpdateEffect(() => {
      if (!isEditing) {
        onEdit(localContent);
      }
    }, [isEditing]);

    if (isEditing) {
      return (
        <ReqoreTextarea
          size={rest.size || 'small'}
          scaleWithContent
          focusRules={{ type: 'auto' }}
          onClearClick={() => setLocalContent('')}
          value={localContent.toString()}
          minimal
          onChange={(e: any) => setLocalContent(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter' && e.shiftKey) {
              setIsEditing(false);
            }
          }}
          onBlur={() => setIsEditing(false)}
        />
      );
    }

    return (
      <ReqorePanel
        flat
        transparent
        minimal
        {...rest}
        onClick={() => setIsEditing(true)}
        tooltip="Click to edit"
      >
        {asMarkdown ? (
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <ReqoreP {...props} />,
            }}
          >
            {localContent.toString()}
          </ReactMarkdown>
        ) : (
          localContent
        )}
        <ReqoreIcon icon="EditLine" size="small" margin="left" />
      </ReqorePanel>
    );
  }
);
