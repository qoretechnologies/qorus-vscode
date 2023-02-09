import { field } from './common_constants';

export const connectionFields = ({ default_target_dir }) => [
  field.targetDir(default_target_dir),
  field.targetFile,
  {
    name: 'name',
    compact: true,
    group: 'info',
  },
  field.desc,
];
