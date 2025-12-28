import Dashboard from './pages/Dashboard';
import ICSStructure from './pages/ICSStructure';
import IncidentDetail from './pages/IncidentDetail';
import IncidentMap from './pages/IncidentMap';
import Incidents from './pages/Incidents';
import Reports from './pages/Reports';
import Resources from './pages/Resources';
import DeletedIncidents from './pages/DeletedIncidents';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "ICSStructure": ICSStructure,
    "IncidentDetail": IncidentDetail,
    "IncidentMap": IncidentMap,
    "Incidents": Incidents,
    "Reports": Reports,
    "Resources": Resources,
    "DeletedIncidents": DeletedIncidents,
}

export const pagesConfig = {
    mainPage: "IncidentDetail",
    Pages: PAGES,
    Layout: __Layout,
};