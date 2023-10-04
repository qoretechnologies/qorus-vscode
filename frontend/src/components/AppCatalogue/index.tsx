import { ReqoreCollection } from '@qoretechnologies/reqore';
import { IReqorePanelProps } from '@qoretechnologies/reqore/dist/components/Panel';
import { size } from 'lodash';
import { useMemo, useState } from 'react';

export interface IAppAction {
  app: string; //the application name
  action: string; //the unique action name in the application
  subtype?: string; //the subtype for the data provider provided by the connection
  path: string; //the data provider path for the action
  path_vars?: Record<string, string>; //descriptions for any path variables
  short_desc: string; //the action's short description in plain text
  desc: string; //the action's long description with markdown formatting
  action_code: number; //the action's code
  action_code_str: string; //a string description of the action code
  action_val?: string; //the action value: message or event type)
}

export interface IApp {
  name: string; // the unique application name;
  display_name: string; //the dispay name for the application
  desc: string; //the application description with markdown formatting
  short_desc: string; //the application short description in plain text
  scheme: string; //any scheme identifying a @ref ConnectionProvider::AbstractConnection "connection" for the application
  oauth2_auth_code: boolean; //indicates if the application supports the OAuth2 authorization code flow
  logo: string; //a link to the logo data that will be served directly
  logo_file_name: string; //the file name of the logo
  logo_mime_type: string; //the mime type for \c logo
  oauth2_client?: {
    //OAuth2 client info, if any
    oauth2_client_id: string; //the OAuth2 client ID to use
    oauth2_client_secret: string; //the OAuth2 client secret to use
    url_type: string; //\c auto: automatically generated or \c required: the user must provide a URL
    oauth2_auth_url: string; //if set, this overrides the REST connection option
    oauth2_token_url: string; //if set, this overrides the REST connection option
    required_options: string[]; //a list of connection options that must be filled in by the user to create the connection
  };
  actions?: IAppAction[]; //list of all actions on each application
}

export interface IAppCatalogueProps {
  apps: IApp[];
}

export const AppCatalogue = ({ apps }: IAppCatalogueProps) => {
  const [selectedApp, setSelectedApp] = useState<IApp>(undefined);

  const breadcrumbs: IReqorePanelProps['breadcrumbs'] = useMemo(() => {
    let result: IReqorePanelProps['breadcrumbs'] = {
      flat: false,
      items: [
        {
          minimal: false,
          icon: 'Apps2Fill',
          label: 'Apps',
          onClick: () => setSelectedApp(undefined),
        },
      ],
    };

    if (selectedApp) {
      result.items.push({
        label: selectedApp.display_name,
        icon: 'EmotionHappyFill',
        leftIconProps: {
          image: selectedApp.logo,
        },
        active: true,
      });
    }

    return result;
  }, [selectedApp]);

  if (selectedApp) {
    return (
      <ReqoreCollection
        filterable
        sortable
        zoomable
        fill
        inputInTitle={false}
        responsiveTitle={false}
        inputProps={{ fluid: true }}
        defaultZoom={0.5}
        breadcrumbs={breadcrumbs}
        items={selectedApp.actions.map((action) => ({
          label: action.action,
          content: action.short_desc,
          expandable: true,
          expandedContent: action.desc,
          iconImage: selectedApp.logo,
        }))}
      />
    );
  }

  return (
    <ReqoreCollection
      filterable
      fill
      sortable
      zoomable
      responsiveTitle={false}
      inputInTitle={false}
      inputProps={{ fluid: true }}
      defaultZoom={0.5}
      breadcrumbs={breadcrumbs}
      items={apps.map((app) => ({
        label: app.display_name,
        badge: size(app.actions),
        content: app.short_desc,
        iconImage: app.logo,
        onClick: () => setSelectedApp(app),
      }))}
    />
  );
};
