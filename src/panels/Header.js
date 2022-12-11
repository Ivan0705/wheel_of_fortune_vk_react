import * as React from "react";
import header from "./Heades.module.css"

class Header extends React.Component {
    render() {
        return <div>
            <h1 className={header.header}>WHEEL OF FORTUNE</h1>
        </div>
    }
}
export default Header
