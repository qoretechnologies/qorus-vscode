import { extensions } from 'vscode';
import { GitExtension, API, Branch, Ref, Repository } from './@types/git';
import { QorusRepository, QorusRepositoryCurrentBranch } from './QorusRepository';
import { t } from 'ttag';
import * as msg from './qorus_message';


export class QorusRepositoryGit implements QorusRepository {
    private git: API | undefined = undefined;
    private repository: Repository | undefined = undefined;

    init(folder: string): Thenable<void> {
        if (this.repository) {
            return Promise.resolve();
        }
        return extensions.getExtension<GitExtension>('vscode.git').activate().then(
            git_extension => {
                this.git = git_extension.getAPI(1);
                if (!this.git) {
                    return Promise.reject(t`ErrorInInitializingGitExtension`);
                }
                for (let i in this.git.repositories) {
                    const repo: Repository = this.git.repositories[i];
                    if (folder.indexOf(repo.rootUri.fsPath) == 0) {
                        this.repository = repo;
                        return Promise.resolve();
                    }
                }
                return Promise.reject(t`UnableDetermineRepository`);
            },
            error => {
                return Promise.reject(t`ErrorInActivatingGitExtension` + ': ' + JSON.stringify(error));
            }
        );
    }

    currentBranch(): QorusRepositoryCurrentBranch {
        const branch: Branch | undefined = this.repository.state.HEAD;
        if (!branch) {
            msg.error(t`UnableDetermineRepositoryBranch`);
            return {
                name: '',
                commit: '',
                up_to_date: false
            };
        }
        return {
            name: branch.name,
            commit: branch.commit,
            up_to_date: this.upToDate()
        };
    }

    commits(hash_filter: string = '', branch_filter: string = '', tag_filter: string = ''): string[] {
        const current_commit = this.currentBranch().commit;
        let commits = this.repository.state.refs.reduce(
            (accumulator, ref: Ref) => {
                if (ref.commit.indexOf(hash_filter) != 0 || ref.commit == current_commit) {
                    return accumulator;
                }
                let commit = accumulator.find(element => element.hash == ref.commit);
                if (!commit) {
                    commit = {hash: ref.commit};
                    accumulator.push(commit);
                }
                commit[['local', 'remote', 'tag'][ref.type]] = ref.name;
                return accumulator;
            },
            []
        );

        // so far only hash_filter has been applied
        let to_remove = [];
        for (let index in commits) {
            const i = parseInt(index);
            const commit = commits[i];
            const branch_name = (commit.local || '') + '\t\n\t\n' + (commit.remote || '');
            if (branch_name.indexOf(branch_filter) < 0) {
                to_remove.push(i);
                continue;
            }
            if (tag_filter && (!commit.tag || commit.tag.indexOf(tag_filter) < 0)) {
                to_remove.push(i);
            }
        }
        while (to_remove.length) {
            commits.splice(to_remove.pop(), 1);
        }

        return commits;
    }

    changedFiles(commit: string, folder: string, source_dirs: string[]): Promise<string[]> {
        return this.repository.diffWith(commit, folder).then(
            diff => {
                const lines = diff.split(/\r?\n/).filter(line => line.indexOf('+++ b/') == 0);
                return lines.map(line => line.substr(6)).filter(file => {
                    for (let dir of source_dirs) {
                        if (file.indexOf(dir + '/') == 0) {
                            return true;
                        }
                    }
                    return false;
                });
            }
        );
    }

    private upToDate(): boolean {
        if (this.repository.state.workingTreeChanges.length) {
            return false;
        }
        if (this.repository.state.indexChanges.length) {
            return false;
        }
        if (this.repository.state.mergeChanges.length) {
            return false;
        }
        if (!this.repository.state.HEAD.upstream) {
            return false;
        }
        if (this.repository.state.HEAD.ahead != 0) {
            return false;
        }
        if (this.repository.state.HEAD.behind != 0) {
            return false;
        }
        return true;
    }
}
