import { Link } from "@helper/models/CommonTypes";

export type AllureMeta = {
  epic?: string;
  feature?: string;
  story?: string | string[];
  severity?: string;

  issues?: Link[];
  tmsIds?: Link[];
  links?: Link[];

  owner?: string;
  component?: string;

  tags?: string[];

  description?: string;
};
