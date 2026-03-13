// src/helper/reporting/AllureReporter.ts

import * as allure from 'allure-js-commons';
import os from 'os';
import { AllureMeta } from '../../helper/reporting/AllureMeta';
import { SetupConstants } from '../../support/constants/SetupConstants';

export class AllureReporter {
  public static async attachDetails(meta: AllureMeta): Promise<void> {
    await allure.owner(meta.owner || os.userInfo().username);

    if (meta.epic) await allure.epic(meta.epic);
    if (meta.feature) await allure.feature(meta.feature);
    if (meta.story) await allure.story(meta.story.toString());
    if (meta.severity) await allure.severity(meta.severity);

    if (meta.description) {
      await allure.description(meta.description);
    }

    if (meta.tags?.length) {
      for (const tag of meta.tags) {
        await allure.tags(tag);
      }
    }

    if (meta.issues?.length) {
      for (const issue of meta.issues) {
        if (issue !== SetupConstants.EMPTY_TEXT) {
          await allure.link(`${process.env.LINK}${issue}`, `ISSUE-${issue}`);
        }
      }
    }

    if (meta.tmsIds?.length) {
      for (const id of meta.tmsIds) {
        await allure.link(`${process.env.TMS_LINK}${id}`, `TMS-${id}`);
      }
    }

    if (meta.component) {
      await allure.label('component', meta.component);
    }
  }
}
