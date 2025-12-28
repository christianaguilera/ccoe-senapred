import Dashboard from './pages/Dashboard';
import ICSStructure from './pages/ICSStructure';
import IncidentMap from './pages/IncidentMap';
import Incidents from './pages/Incidents';
import Reports from './pages/Reports';
import Resources from './pages/Resources';
import IncidentDetail from './pages/IncidentDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "ICSStructure": ICSStructure,
    "IncidentMap": IncidentMap,
    "Incidents": Incidents,
    "Reports": Reports,
    "Resources": Resources,
    "IncidentDetail": IncidentDetail,
}

export const pagesConfig = {
    mainPage: "IncidentDetail",
    Pages: PAGES,
    Layout: __Layout,
};