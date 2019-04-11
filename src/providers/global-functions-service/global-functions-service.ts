import { Injectable } from '@angular/core';
import {GoalDetailsServiceProvider} from "../goal-details-service/goal-details-service";


@Injectable()
export class GlobalFunctionsServiceProvider {

  constructor(private goalDetails: GoalDetailsServiceProvider) {
  }


  getWhetherMigraine(symptomDict){
    // todo: maybe have it be true/false/null?  Right now no indication means false in this
    if(symptomDict === undefined) return false;
    if('Migraine today' in symptomDict) return symptomDict['Migraine today'];
    else if('peakMigraineSeverity' in symptomDict && Number(symptomDict['peakMigraineSeverity']) > 0){
      return true;
    }
    else if('migraineDuration' in symptomDict){
      return true;
    }
    else if('migraineStartTime' in symptomDict){
      return true;
    }
    return false;
  }

  getGoalHierarchy(goals){
    let allGoals = {};
    let allSubgoals = this.goalDetails.getSubgoalList();
    let allGoalTypes = this.goalDetails.getGoalList();
    for(let i=0; i<goals.length; i++){
      if(goals[i] in allSubgoals){
        let possibleSubgoals = allSubgoals[goals[i]].subgoals;
        let subgoals = [];
        for(let j=0; j<possibleSubgoals.length; j++){
          if(goals.indexOf(possibleSubgoals[j]['subgoalName'])>-1){
            subgoals.push(possibleSubgoals[j]['subgoalName']);
          }
        }
        allGoals[goals[i]] = subgoals;
      }
      else{
        for(let j=0; j<allGoalTypes.length; j++){
          if(allGoalTypes[j].goalName === goals[i]){
            allGoals[goals[i]] = undefined;
          }
        }
      }
    }
    return allGoals;
  }


  getDataIDs(dataToTrack : {[dataType: string] : any}) : string[] {
    if(!dataToTrack) return [];
    let dataIDs = [];
    let dataTypes = Object.keys(dataToTrack);
    for(let i=0; i<dataTypes.length; i++){
      for(let j=0; j<dataToTrack[dataTypes[i]].length; j++){
        dataIDs.push(dataToTrack[dataTypes[i]][j].id);
      }
    }
    return dataIDs;
  }



  getAllGoalsAndSubgoals(configPath) {
    let goals = [];
    for (let i = 0; i < configPath.length; i++) {
      if(configPath[i].step.includes("goal")){
        goals = goals.concat(configPath[i].added);
      }
    }
    return goals;
  }


  getWhetherTrackingMeds(dataToTrack){
    if(dataToTrack !== undefined){
      let treatmentList = dataToTrack['Treatments'];
      if(treatmentList !== undefined) {
        for (let i = 0; i < treatmentList.length; i++) {
          if (treatmentList[i]['name'] === 'As-needed medications today') {
            return true;
          }
        }
      }
    }
    return false;
  }




  calculatePriorGoalProgress(data, dataType, previouslyTracked, timespan=undefined) {
    let timesTracked = 0;
    if(!timespan){
      timespan = data.goal.timespan;
    }
    for(let i=0; i<previouslyTracked.length; i++){
      if(previouslyTracked[i][dataType] === undefined
        || previouslyTracked[i][dataType][data.name] === undefined) {
        continue;
      }
      let today = new Date();
      let cutoff;
      if(timespan === "Week") {
        cutoff = new Date().setDate(today.getDate() - 7);
      }
      else if(timespan === "Month"){
        cutoff = new Date().setMonth(today.getMonth() - 1);
      }
      else{
        continue; // if it's daily we don't bother, since they can see what they entered
      }
      if(previouslyTracked[i]['dateTracked'] > cutoff) {
        if(data.field === 'number'){
          timesTracked += Number(previouslyTracked[i][dataType][data.name]);
        }
        else if(data.field !== 'binary' || previouslyTracked[i][dataType][data.name] === true){
          timesTracked += 1;
        }
      }
    }
    return timesTracked;
  }


  buttonColors(added){
    if(added){
      return {"add": "secondary", "remove": "light"};
    }
    else{
      return {"add": "light", "remove": "danger"};
    }
  }


  toggleDetails(configStep) {
    if (configStep.showDetails || configStep.showDetails == undefined) {
      configStep.showDetails = false;
      configStep.icon = 'ios-add-circle-outline';
    }
    else {
      configStep.showDetails = true;
      configStep.icon = 'ios-remove-circle-outline';
    }
    return configStep;
  }

}
