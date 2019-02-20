import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule} from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import {HttpClientModule} from "@angular/common/http";

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CouchDbServiceProvider } from '../providers/couch-db-service/couch-db-service';
import {GoalTypePage} from "../pages/addGoal/goal-type/goal-type";
import {LoginPage} from "../pages/login/login";
import { GoalDetailsServiceProvider } from '../providers/goal-details-service/goal-details-service';
import {SelectSubgoalsPage} from "../pages/addGoal/select-subgoals/select-subgoals";
import { GlobalFunctionsServiceProvider } from '../providers/global-functions-service/global-functions-service';
import {EnterTextGoalPage} from "../pages/addGoal/enter-text-goal/enter-text-goal";
import {DataConfigPage} from "../pages/addGoal/data-config/data-config";
import { DataDetailsServiceProvider } from '../providers/data-details-service/data-details-service';
import {AddCustomDataPage} from "../pages/addGoal/add-custom-data/add-custom-data";
import {ViewDataDetailsPage} from "../pages/addGoal/view-data-details/view-data-details";
import {SelectTrackingFrequencyPage} from "../pages/addGoal/select-tracking-frequency/select-tracking-frequency";
import {ConfigureNotificationsPage} from "../pages/addGoal/configure-notifications/configure-notifications";
import {EditDataPage} from "../pages/addGoal/edit-data/edit-data";
import {TrackDataPage} from "../pages/track-data/track-data";
import {GoalModificationPage} from "../pages/goal-modification/goal-modification";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GoalTypePage,
    SelectSubgoalsPage,
    LoginPage,
    EnterTextGoalPage,
    DataConfigPage,
    ViewDataDetailsPage,
    AddCustomDataPage,
    SelectTrackingFrequencyPage,
    ConfigureNotificationsPage,
    EditDataPage,
    TrackDataPage,
    GoalModificationPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    GoalTypePage,
    LoginPage,
    SelectSubgoalsPage,
    EnterTextGoalPage,
    DataConfigPage,
    ViewDataDetailsPage,
    AddCustomDataPage,
    SelectTrackingFrequencyPage,
    ConfigureNotificationsPage,
    EditDataPage,
    TrackDataPage,
    GoalModificationPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    CouchDbServiceProvider,
    GoalDetailsServiceProvider,
    GlobalFunctionsServiceProvider,
    DataDetailsServiceProvider
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
