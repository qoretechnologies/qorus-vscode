import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Navbar, NavbarGroup } from "@blueprintjs/core";
import { ProjectConfigContainer as ProjectConfig } from "./project_config/ProjectConfig";
import { ReleasePackageContainer as ReleasePackage } from "./release_package/ReleasePackage";
import { DeleteInterfacesContainer as DeleteInterfaces } from "./delete_interfaces/DeleteInterfaces";
import { CreateInterfaceContainer as CreateInterface } from "./create_interface/CreateInterface.tsx";
import { vscode } from "./common/vscode";
import logo from "../images/qorus_logo_256.png";
import { hot } from "react-hot-loader/root";

class App extends Component {
    constructor() {
        super();

        this.texts = {};
        this.num_text_requests = 0;

        window.addEventListener("message", event => {
            switch (event.data.action) {
                case "return-text":
                    this.texts[event.data.text_id] = event.data.text;
                    if (--this.num_text_requests == 0) {
                        this.forceUpdate();
                    }
                    break;
                case "set-active-tab":
                    this.props.setActiveTab(event.data.active_tab);
                    break;
            }
        });
    }

    t = text_id => {
        if (this.texts[text_id]) {
            return this.texts[text_id];
        }
        vscode.postMessage({
            action: "get-text",
            text_id: text_id,
        });
        this.num_text_requests++;
    };

    render() {
        const t = this.t;
        const dict_length = Object.keys(this.texts).length;

        const Tabs = {
            ProjectConfig: "cog",
            ReleasePackage: "cube",
            DeleteInterfaces: "trash",
            CreateInterface: "draw",
        };

        return (
            <>
                <Navbar fixedToTop={true}>
                    <NavbarGroup>
                        <img
                            style={{
                                maxWidth: 30,
                                maxHeight: 30,
                                marginRight: 54,
                            }}
                            src={logo}
                        />
                        {Object.keys(Tabs).map(tab_key => (
                            <Button
                                minimal={true}
                                icon={Tabs[tab_key]}
                                key={tab_key}
                                active={tab_key == this.props.active_tab}
                                onClick={() => this.props.setActiveTab(tab_key)}
                                text={t(tab_key + "-buttonText")}
                                title={t(tab_key + "-buttonTitle")}
                            />
                        ))}
                    </NavbarGroup>
                </Navbar>

                {this.props.active_tab == "ProjectConfig" && (
                    <ProjectConfig t={this.t} _={dict_length} />
                )}
                {this.props.active_tab == "ReleasePackage" && (
                    <ReleasePackage t={this.t} _={dict_length} />
                )}
                {this.props.active_tab == "DeleteInterfaces" && (
                    <DeleteInterfaces t={this.t} _={dict_length} />
                )}
                {this.props.active_tab == "CreateInterface" && (
                    <CreateInterface t={this.t} _={dict_length} />
                )}
            </>
        );
    }
}

const mapStateToProps = state => ({
    active_tab: state.active_tab,
});

const mapDispatchToProps = dispatch => ({
    setActiveTab: tab_key => {
        dispatch({ type: "active_tab", active_tab: tab_key });
    },
});

export const AppContainer = hot(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(App)
);
