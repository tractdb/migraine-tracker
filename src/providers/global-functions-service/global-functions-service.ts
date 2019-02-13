import { Injectable } from '@angular/core';


@Injectable()
export class GlobalFunctionsServiceProvider {

  constructor() {
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

  calculatePriorGoalProgress(data, dataType, previouslyTracked) {
    let timesTracked = 0;
    for(let i=0; i<previouslyTracked.length; i++){
      console.log(previouslyTracked[i]);
      if(previouslyTracked[i][dataType] === undefined
        || previouslyTracked[i][dataType][data.name] === undefined) {
        continue;
      }
      let today = new Date();
      let cutoff;
      if(data.goal.timespan === "Week") {
        cutoff = new Date().setDate(today.getDate() - 7);
      }
      else if(data.goal.timespan === "Month"){
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
