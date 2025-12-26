import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import IncidentDetail from './pages/IncidentDetail';
import Resources from './pages/Resources';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Incidents": Incidents,
    "IncidentDetail": IncidentDetail,
    "Resources": Resources,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};