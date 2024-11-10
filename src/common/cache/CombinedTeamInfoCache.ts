import Cache from "../models/Cache";
import { ITeamsOutput, ITeamsOutput_data } from "nhl-api-wrapper-ts/dist/interfaces/stats/teams/Teams";
import nhlApi from "nhl-api-wrapper-ts";
import Stumper from "stumper";
import FailedToUpdateCacheException from "../exceptions/FailedToUpdateCacheException";
import { IFranchisesOutput, IFranchisesOutput_data } from "nhl-api-wrapper-ts/dist/interfaces/stats/franchise/Franchises";
import { ICombinedTeamInfo } from "../interfaces/ICombinedTeamInfo";

export default class CombinedTeamInfoCache extends Cache<ICombinedTeamInfo[]> {
  private static instance: CombinedTeamInfoCache;

  private teamsCache: ITeamsOutput | undefined;
  private franchisesCache: IFranchisesOutput | undefined;

  private constructor() {
    // Run every 2 hours
    super("TeamInfoCache", "0 0 */2 * * *");
  }

  static getInstance(): CombinedTeamInfoCache {
    if (!CombinedTeamInfoCache.instance) {
      CombinedTeamInfoCache.instance = new CombinedTeamInfoCache();
    }
    return CombinedTeamInfoCache.instance;
  }

  protected async updateCache(): Promise<void> {
    const teamsResponse = await nhlApi.teams.getTeams({ lang: "en" });
    if (teamsResponse.status == 200) {
      this.teamsCache = teamsResponse.data;
    } else {
      Stumper.error(`Error fetching the team data from the NHL API! Status code: ${teamsResponse.status}`, "common:TeamInfoCache:updateCache");
      throw new FailedToUpdateCacheException();
    }

    const franchisesResponse = await nhlApi.teams.getFranchiseInfo({ lang: "en" });
    if (franchisesResponse.status == 200) {
      this.franchisesCache = franchisesResponse.data;
    } else {
      Stumper.error(
        `Error fetching the franchise data from the NHL API! Status code: ${franchisesResponse.status}`,
        "common:TeamInfoCache:updateCache",
      );
      throw new FailedToUpdateCacheException();
    }

    const combinedTeamsInfo: ICombinedTeamInfo[] = [];
    for (const team of this.teamsCache.data) {
      const franchise = this.franchisesCache.data.find((franchise) => franchise.id == team.franchiseId);
      if (franchise) {
        combinedTeamsInfo.push({ teamId: team.id, franchiseId: franchise.id, team: team, franchise: franchise });
      }
    }

    this.cache = combinedTeamsInfo;
  }

  getTeamByTeamId(teamId: number): ICombinedTeamInfo | undefined {
    return this.cache?.find((team) => team.teamId == teamId);
  }

  getTeamByFranchiseId(franchiseId: number): ICombinedTeamInfo | undefined {
    return this.cache?.find((team) => team.franchiseId == franchiseId);
  }

  getTeamCache(): ITeamsOutput_data[] | undefined {
    return this.teamsCache?.data;
  }

  getFranchiseCache(): IFranchisesOutput_data[] | undefined {
    return this.franchisesCache?.data;
  }
}
