export type AllureMeta = {
  epic?: string;
  feature?: string;
  story?: string | string[];
  severity?: string;

  issues?: string[];
  tmsIds?: string[];

  owner?: string;
  component?: string;

  tags?: string[];

  description?: string;
};
