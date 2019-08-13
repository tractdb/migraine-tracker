import * as moment from "moment";
import _date = moment.unitOfTime._date;


export interface Goal {
  name: string, // name of the goal (e.g., "monitoring")
  goalID: string, // made it easier to modify/specify things
  goodChoiceIf: string, // some explanation for when they're setting up
  suggestedFrequency: string, // regular or retroactive
  visType: string, // for the data visualizations
  iconName?: string, // only for top goals
  hasSubgoals?: boolean,
  subgoals?: [Goal],
  effort?: "low" | "medium" | "high", // only for top goals
  isTopGoal?: boolean // meaning not a subgoal
}



export interface DataType {
  dataType: string, // name of the data type (e.g., symptom)
  dataGoals: boolean, // whether you can set element-specific goals (e.g., "I want to exercise x hours")
  description?: string, // for a better page title, where applicable
  conditionalGoals?: string[], // e.g., "changes" only if learning:changes selected
  startDate?: boolean, // currently only for before/after
  recommendForGoals?: string[], // when we don't recommend SPECIFIC ones but they need to track some
  toDisplay?: string,
  visTypes?: "beforeAfter" | "overTime" | "correlation" [] // "other" currently has no visualizations :-/
}


export interface DataElement {
  name: string,
  recommendingGoals?: string[],
  custom?: boolean,
  isMed?: boolean,
  id?: string, // only for non-custom elements
  explanation?: string,
  fieldDescription?: string,
  recommendedField?: string,
  fieldsAllowed?: string[],
  goal?: ElementGoal,
  suggestedGoal?: ElementGoal,
  field?: string, // required for set fields
  quickTrack?: boolean, //whether it's a quick tracker, if it's selected
  alwaysQuickTrack?: boolean, // whether we just always include it as a quick tracker, even if not selected
  fieldSet?: boolean // whether the field is "set" (i.e., people can't change it)
  selected?: boolean,
  dataType?: string,
  opts?: any
}

export interface ElementGoal{
  freq: string, //"Less" | "More", <- that's supposed to work, but won't
  threshold: number,
  timespan: string //"Day" | "Week" | "Month"
}

export interface DataField {
  name: string,
  explanation: string
}



export interface Notification{
  delayNum?: number,
  delayScale?: string, //"Hour" | "Day"; <- that's supposed to work, but won't
  timescale?: string, //"Daily" | "Weekly" | "Monthly",
  dayOfWeek?: string, //"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
  dayOfMonth?: string,
  timeOfDay?: string
}


export interface ConfiguredRoutine {
  goals: string[],
  dataToTrack: {[dataType:string] : DataElement[]},
  quickTrackers?: DataElement[],
  textGoals?: string,
  dateAdded: Date | string,
  notifications: {[notificationType:string] : Notification}
}

export interface DataReport {
//   date: string | Date,
//   // dataType: string
}



export interface Break {
  notifyDate?: string,
  dateToCheckIn?: string,
  started: Date,
  ended?: Date,
  noDates?: boolean
}



export interface MigraineQACategories {
  category: string,
  questions: MigraineQA[]
}

export interface MigraineQA{
  question: string,
  answer: string,
  expanded?: boolean
}
