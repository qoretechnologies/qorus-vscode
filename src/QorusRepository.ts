export interface QorusRepositoryCurrentBranch {
    name: string;
    commit: string;
    up_to_date: boolean;
}

export interface QorusRepository {
    init(folder: string): Thenable<void>;
    currentBranch(): QorusRepositoryCurrentBranch;
    commits(hash_filter: string, branch_filter: string, tag_filter: string): string[];
    changedFiles(commit: string, folder: string, source_dirs: string[]): Promise<string[]>;
}
