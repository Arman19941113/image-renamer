import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import t from '@/render/language';

function Hello() {
  return <div>{t('图片智能命名')}</div>;
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
