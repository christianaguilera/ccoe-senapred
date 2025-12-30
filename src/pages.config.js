import DeletedIncidents from './pages/DeletedIncidents';
import ICSStructure from './pages/ICSStructure';
import IncidentDetail from './pages/IncidentDetail';
import IncidentMap from './pages/IncidentMap';
import Incidents from './pages/Incidents';
import NotificationRules from './pages/NotificationRules';
import RegionalLinkPlan from './pages/RegionalLinkPlan';
import Reports from './pages/Reports';
import Resources from './pages/Resources';
import Dashboard from './pages/Dashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "DeletedIncidents": DeletedIncidents,
    "ICSStructure": ICSStructure,
    "IncidentDetail": IncidentDetail,
    "IncidentMap": IncidentMap,
    "Incidents": Incidents,
    "NotificationRules": NotificationRules,
    "RegionalLinkPlan": RegionalLinkPlan,
    "Reports": Reports,
    "Resources": Resources,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "IncidentDetail",
    Pages: PAGES,
    Layout: __Layout,
};