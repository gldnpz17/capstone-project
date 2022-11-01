import LoginForm from './pages/LoginForm.js'
import AccManagement from './pages/AccManagement'
import { BrowserRouter, createBrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { createTheme, ThemeProvider } from '@mui/material';
import { AuthorizationRuleEditor } from './pages/AuthorizationRuleEditor.js';
import SmartLockList from './pages/SmartLockList.js';

const graphqlClient = new ApolloClient({
    uri: "http://localhost:4000",
    cache: new InMemoryCache()
})

function App() {
    const theme = createTheme({
        props: {
            smallFormField: {
                size: "small", 
                variant: "outlined", 
                fullWidth: true, 
            }
        }
    })

    return (
        <div className="page">
            <ApolloProvider client={graphqlClient}>
                <ThemeProvider theme={theme}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/admin">
                                <Route path="login" element={<LoginForm />} />
                                <Route path="accounts" element={<AccManagement />} />
                                <Route path="smart-locks" element={<SmartLockList />} />
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
