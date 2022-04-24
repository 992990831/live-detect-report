
import React, { useEffect } from 'react';
import 'antd/dist/antd.css';
import { HashRouter as Router, Route, Link, Routes, useNavigate } from "react-router-dom";

import { LiveVideoReport } from './pages/LiveVideoReport';
import { SessionCodeReport } from './pages/SessionCodeReport';
import { Config, Callback } from './pages/Config';


import { Common } from './Common';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path={"/"} element={<LiveVideoReport></LiveVideoReport>} />
          <Route path={Common.Home + "/livevideo"} element={<LiveVideoReport></LiveVideoReport>} />
          <Route path={"/config"} element={<Config></Config>} />
          <Route path={"/code"} element={<SessionCodeReport />} />
          <Route path={"/callback"} element={<Callback />} />
        </Routes>
      </Router>
      {/* <p className='App-term'>—上海敏识网络科技有限公司提供技术支持—</p> */}
    </>

  );
}

export default App;
