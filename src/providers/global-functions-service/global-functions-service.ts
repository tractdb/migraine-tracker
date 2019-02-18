import { Injectable } from '@angular/core';
import {GoalDetailsServiceProvider} from "../goal-details-service/goal-details-service";


@Injectable()
export class GlobalFunctionsServiceProvider {

  constructor(private goalDetails: GoalDetailsServiceProvider) {
  }

  getGoalHierarchy(goals){
    let allGoals = {};
    let allSubgoals = this.goalDetails.getSubgoalList();
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
    }
    return allGoals;
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


  findNextConfigData(configPath, configDataList) {
    let totalDataTypes = configDataList.length;
    for(let i = 0; i < totalDataTypes; i++) {
      let dataType = configDataList.splice(0, 1)[0];
      if(!(dataType.conditionalGoal)){
        return {"dataType": dataType, "configList": configDataList};
      }
      else{
        for (let i = 0; i < configPath.length; i++) {
          if (configPath[i].added.includes(dataType.conditionalGoal)) {
            return {"dataType": dataType, "configList": configDataList};
          }
        }
      }
    }
    return null;
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
