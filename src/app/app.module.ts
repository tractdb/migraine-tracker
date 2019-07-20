import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule} from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import {HttpClientModule} from "@angular/common/http";

import { MyApp } from './app.component';
import { NgCalendarModule  } from 'ionic2-calendar';

import { HomePage } from '../pages/home/home';



import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CouchDbServiceProvider } from '../providers/couch-db-service/couch-db-service';
import {GoalTypePage} from "../pages/addGoal/goal-type/goal-type";
import {LoginPage} from "../pages/login/login";
import { GoalDetailsServiceProvider } from '../providers/goal-details-service/goal-details-service';
import { GlobalFunctionsServiceProvider } from '../providers/global-functions-service/global-functions-service';
import {DataConfigPage} from "../pages/addGoal/data-config/data-config";
import { DataDetailsServiceProvider } from '../providers/data-details-service/data-details-service';
import {AddCustomDataPage} from "../pages/addGoal/add-custom-data/add-custom-data";
import {SelectTrackingFrequencyPage} from "../pages/addGoal/select-tracking-frequency/select-tracking-frequency";
import {ConfigureNotificationsPage} from "../pages/addGoal/configure-notifications/configure-notifications";
import {EditDataPage} from "../pages/addGoal/edit-data/edit-data";
import {TrackDataPage} from "../pages/track-data/track-data";
import {GoalModificationPage} from "../pages/goal-modification/goal-modification";
import {TrackingModificationPage} from "../pages/tracking-modification/tracking-modification";
import {DataCalendarPage} from "../pages/data-calendar/data-calendar";
import {DataSummaryPage} from "../pages/data-summary/data-summary";
import {FaqPage} from "../pages/faq/faq";
import {UsedQuickTrackPage} from "../pages/used-quick-track/used-quick-track";
import {BreakFromTrackingPage} from "../pages/break-from-tracking/break-from-tracking";
import { GeneralInfoServiceProvider } from '../providers/general-info-service/general-info-service';
import { DateFunctionServiceProvider } from '../providers/date-function-service/date-function-service';
import {ViewDatapointPage} from "../pages/view-datapoint/view-datapoint";
import {DataVisPage} from "../pages/data-vis/data-vis";
import { ChartsModule } from 'ng2-charts-x';
import {DataElementTrackingComponent} from "../components/data-element-tracking/data-element-tracking";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GoalTypePage,
    LoginPage,
    DataConfigPage,
    AddCustomDataPage,
    SelectTrackingFrequencyPage,
    ConfigureNotificationsPage,
    EditDataPage,
    TrackDataPage,
    GoalModificationPage,
    TrackingModificationPage,
    DataCalendarPage,
    DataSummaryPage,
    FaqPage,
    UsedQuickTrackPage,
    BreakFromTrackingPage,
    ViewDatapointPage,
    DataVisPage,
    DataElementTrackingComponent
  ],
  imports: [
    BrowserModule,
    NgCalendarModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    ChartsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    GoalTypePage,
    LoginPage,
    DataConfigPage,
    AddCustomDataPage,
    SelectTrackingFrequencyPage,
    ConfigureNotificationsPage,
    EditDataPage,
    TrackDataPage,
    GoalModificationPage,
    TrackingModificationPage,
    DataCalendarPage,
    DataSummaryPage,
    FaqPage,
    UsedQuickTrackPage,
    BreakFromTrackingPage,
    ViewDatapointPage,
    DataVisPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    CouchDbServiceProvider,
    GoalDetailsServiceProvider,
    GlobalFunctionsServiceProvider,
    DataDetailsServiceProvider,
    GeneralInfoServiceProvider,
    DateFunctionServiceProvider
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
