import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import IncidentDetail from './pages/IncidentDetail';
import Resources from './pages/Resources';
import ICSStructure from './pages/ICSStructure';
import IncidentMap from './pages/IncidentMap';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Incidents": Incidents,
    "IncidentDetail": IncidentDetail,
    "Resources": Resources,
    "ICSStructure": ICSStructure,
    "IncidentMap": IncidentMap,
}

export const pagesConfig = {
    mainPage: "IncidentDetail",
    Pages: PAGES,
    Layout: __Layout,
};