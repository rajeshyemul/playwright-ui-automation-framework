export type AllureMeta = {
  epic?: string;
  feature?: string;
  story?: string | string[];
  severity?: string;

  issues?: string[];
  tmsIds?: string[];
  links?: { name: string; url: string }[];

  owner?: string;
  component?: string;

  tags?: string[];

  description?: string;
};
