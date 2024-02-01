import { t } from 'ttag';
import { extensions } from 'vscode';
import { API, Branch, GitExtension, Ref, Repository } from './@types/git';
import { QorusRepository, QorusRepositoryCurrentBranch } from './QorusRepository';

export class QorusRepositoryGit implements QorusRepository {
  private git: API | undefined = undefined;
  private repository: Repository | undefined = undefined;

  init(folder: string): Thenable<void> {
    if (this.repository) {
      return Promise.resolve();
    }
    return extensions
      .getExtension<GitExtension>('vscode.git')
      .activate()
      .then(
        (git_extension) => {
          this.git = git_extension.getAPI(1);
          if (!this.git) {
            return Promise.reject(t`ErrorInInitializingGitExtension`);
          }
          for (const i in this.git.repositories) {
            const repo = this.git.repositories[i];
            if (folder.indexOf(repo.rootUri.fsPath) == 0) {
              this.repository = repo;
              return Promise.resolve();
            }
          }
          // issue #1118: work without a git repository
          this.repository = undefined;
          return Promise.resolve();
        },
        (error) => {
          return Promise.reject(t`ErrorInActivatingGitExtension` + ': ' + JSON.stringify(error));
        }
      );
  }

  currentBranch(): QorusRepositoryCurrentBranch {
    // issue #1118: work without a git repository
    const branch: Branch | undefined = this.repository?.state.HEAD;
    if (!branch) {
      return {
        name: '',
        commit: '',
        up_to_date: true,
      };
    }
    return {
      name: branch.name,
      commit: branch.commit,
      up_to_date: this.upToDate(),
    };
  }

  async commits(hash_filter = '', branch_filter = '', tag_filter = ''): Promise<string[]> {
    // issue #1118: work without a git repository
    if (typeof this.repository == 'undefined') {
      return [];
    }

    const refs = await this.repository.getRefs?.();
    console.log('REFS', refs);
    const current_commit = this.currentBranch().commit;
    const commits = refs.reduce((accumulator, ref: Ref) => {
      if (ref.commit.indexOf(hash_filter) != 0 || ref.commit == current_commit) {
        return accumulator;
      }
      let commit = accumulator.find((element) => element.hash == ref.commit);
      if (!commit) {
        commit = { hash: ref.commit };
        accumulator.push(commit);
      }
      commit[['local', 'remote', 'tag'][ref.type]] = ref.name;
      return accumulator;
    }, []);

    // so far only hash_filter has been applied
    const to_remove = [];
    for (const index in commits) {
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
    // issue #1118: work without a git repository
    if (typeof this.repository == 'undefined') {
      return new Promise((resolve) => {
        resolve([]);
      });
    }

    return this.repository.diffWith(commit, folder).then((diff) => {
      const lines = diff.split(/\r?\n/).filter((line) => line.indexOf('+++ b/') == 0);
      return lines
        .map((line) => line.substring(6))
        .filter((file) => {
          for (const dir of source_dirs) {
            if (file.indexOf(dir + '/') == 0) {
              return true;
            }
          }
          return false;
        });
    });
  }

  private upToDate(): boolean {
    // issue #1118: work without a git repository
    if (typeof this.repository == 'undefined') {
      return true;
    }
    // issue #975: cannot return false if 'this.repository.state.workingTreeChanges.length' is non-zero; this
    // would be a false positive returning false if there are untracked files, which should be ignored
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
