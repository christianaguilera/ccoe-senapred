import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import IncidentDetail from './pages/IncidentDetail';
import Resources from './pages/Resources';
import ICSStructure from './pages/ICSStructure';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Incidents": Incidents,
    "IncidentDetail": IncidentDetail,
    "Resources": Resources,
    "ICSStructure": ICSStructure,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};