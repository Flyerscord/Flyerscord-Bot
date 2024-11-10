import { IFranchisesOutput_data } from "nhl-api-wrapper-ts/dist/interfaces/stats/franchise/Franchises";
import { ITeamsOutput_data } from "nhl-api-wrapper-ts/dist/interfaces/stats/teams/Teams";

export interface ICombinedTeamInfo {
  teamId: number;
  franchiseId: number;
  team: ITeamsOutput_data;
  franchise: IFranchisesOutput_data;
}
