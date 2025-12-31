import Dashboard from './pages/Dashboard';
import DeletedIncidents from './pages/DeletedIncidents';
import ICSStructure from './pages/ICSStructure';
import IncidentDetail from './pages/IncidentDetail';
import IncidentMap from './pages/IncidentMap';
import Incidents from './pages/Incidents';
import NotificationRules from './pages/NotificationRules';
import NotificationSettings from './pages/NotificationSettings';
import RegionalLinkPlan from './pages/RegionalLinkPlan';
import Reports from './pages/Reports';
import Resources from './pages/Resources';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "DeletedIncidents": DeletedIncidents,
    "ICSStructure": ICSStructure,
    "IncidentDetail": IncidentDetail,
    "IncidentMap": IncidentMap,
    "Incidents": Incidents,
    "NotificationRules": NotificationRules,
    "NotificationSettings": NotificationSettings,
    "RegionalLinkPlan": RegionalLinkPlan,
    "Reports": Reports,
    "Resources": Resources,
}

export const pagesConfig = {
    mainPage: "IncidentDetail",
    Pages: PAGES,
    Layout: __Layout,
};