import AccManagement from './pages/AccManagement'
import { BrowserRouter, createBrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css';
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { createTheme, ThemeProvider } from '@mui/material';
import { AuthorizationRuleEditor } from './pages/AuthorizationRuleEditor.js';
import SmartLockList from './pages/SmartLockList.js';
import { LoginPage } from './pages/Login.js';
import { NavSideBar } from './components/NavSideBar.js';
import { LockScannerPage } from './pages/LockScanner.js';
import { TestingPage } from './pages/Testing';

const link = createHttpLink({
    uri: "/graphql",
    credentials: 'include'
})

const graphqlClient = new ApolloClient({
    cache: new InMemoryCache(),
    link
})

function App() {
    const theme = createTheme({
        props: {
            smallFormField: {
                size: "small", 
                variant: "outlined", 
                fullWidth: true, 
            }
        },
        palette: {
            primary: {
                main: "#5572c7"
            },
            secondary: {
                main: "#db4d4d"
            }
        },
        typography: {
            fontFamily: [
                'Poppins',
                'sans-serif',
            ].join(','),
        },
    })

    return (
        <div className="page">
            <ApolloProvider client={graphqlClient}>
                <ThemeProvider theme={theme}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/">
                                <Route path="/" element={<LockScannerPage />} />
                                <Route path="login" element={<LoginPage successHref="/" />} />
                            </Route>
                            <Route path="/admin">
                                <Route path="login" element={<LoginPage successHref="/admin/accounts" />} />
                                <Route element={<NavSideBar />}>
                                    <Route path="accounts" element={<AccManagement />} />
                                    <Route path="smart-locks" element={<SmartLockList />} />
                                </Route>
                                <Route path="testing" element={<TestingPage />} />
                                <Route path="editor/:ruleId" element={<AuthorizationRuleEditor />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </ThemeProvider>
            </ApolloProvider>
        </div>
    );
}

export default App;
