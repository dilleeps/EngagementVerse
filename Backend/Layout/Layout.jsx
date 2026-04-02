import { Layout } from "antd";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { HeaderLoader } from "../Components/LoaderBox/Loader";
import "./Header.scss";
import Footer from "./BeforeLoginFooter";

const HeaderNav = HeaderLoader(() => import("./Header"));

const { Header, Content } = Layout;

// function dragElement(elmnt) {
//   let pos1 = 0
//   let pos2 = 0
//   let pos3 = 0
//   let pos4 = 0

//   if (document.getElementById(`${elmnt.id}header`)) {
//     /* if present, the header is where you move the DIV from: */
//     document.getElementById(`${elmnt.id}header`).onmousedown = dragMouseDown
//   } else {
//     /* otherwise, move the DIV from anywhere inside the DIV: */
//     elmnt.onmousedown = dragMouseDown
//   }

//   function dragMouseDown(e) {
//     e = e || window.event
//     e.preventDefault()
//     // get the mouse cursor position at startup:
//     pos3 = e.clientX
//     pos4 = e.clientY
//     document.onmouseup = closeDragElement
//     // call a function whenever the cursor moves:
//     document.onmousemove = elementDrag
//   }

//   function elementDrag(e) {
//     e = e || window.event
//     e.preventDefault()
//     // calculate the new cursor position:
//     pos1 = pos3 - e.clientX
//     pos2 = pos4 - e.clientY
//     pos3 = e.clientX
//     pos4 = e.clientY
//     // set the element's new position:
//     elmnt.style.top = `${elmnt.offsetTop - pos2}px`
//     elmnt.style.left = `${elmnt.offsetLeft - pos1}px`
//   }

//   function closeDragElement() {
//     /* stop moving when mouse button is released: */
//     document.onmouseup = null
//     document.onmousemove = null
//   }
// }

export default function Layouts(props) {
  // const [collapsed, setCollapsed] = useState(false)
  const history = useHistory();

  history.listen(() => {
    const appView = document.getElementById("app-view");

    if (appView) {
      appView.scrollIntoView();
    }
  });

  useEffect(() => {
    const currentUser = localStorage.getItem("ACCOUNTING_USER");

    if (!currentUser) {
      history.push("/");
    }
  }, []);

  // const toggle = () => {
  //   setCollapsed(!collapsed)
  // }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <div id="app-view" />
      {/* <Sider trigger={null} collapsible collapsed={collapsed}>
          <Sidemenu {...props} collapsed={collapsed} />
          <div style={{ color: '#fff', position: 'absolute', bottom: 10, textAlign: 'center', width: '100%', }} onClick={toggle}>{collapsed ? <i className="flaticon-double-right-arrows-angles" /> : <i className="flaticon-arrowheads-of-thin-outline-to-the-left" />}</div>
        </Sider> */}
      <Layout className="site-layout">
        <Header
          className="site-layout-background fixed-header"
          id="fixed-header"
          style={{ padding: 0 }}
        >
          <HeaderNav {...props} />
        </Header>
        {/* <WizardSteps /> */}
        <Content className="site-layout-background default-spacing">
          {/* <div id="stop-timer" className="stop-timer">
              <div id="time-count">10:00:00</div>
              <div className="stop-icon">
                <img src={import('../assets/images/timer.svg')} alt="stop timer" title="Stop Timer"/>
              </div>
            </div> */}
          {props.children}
        </Content>
        {/* <Footer className="">
          <Footer />
        </Footer> */}
      </Layout>
    </Layout>
  );
}
