import React, {Component} from 'react';

const customStyles = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
};

class Settings extends Component {

    constructor() {
        super();

        this.state = {

        }
    }

    render() {

        const getInput = (k, v) => {
            switch (k) {
                case 'fps':
                    return <input type={'number'} min={10} value={v} onChange={(e) => {
                        e.preventDefault()
                        console.log(e.target.value)
                        this.props.changeValue(k, parseInt(e.target.value))
                    }}/>
                case 'lhd':
                    return <input type={"checkbox"} checked={v} onChange={(e) => {
                        e.preventDefault()
                        console.log(e.target.checked)
                        this.props.changeValue(k, + e.target.checked)
                    }}/>
                case 'kiosk':
                    return <input type={'checkbox'} checked={v} onChange={(e) => {
                        e.preventDefault()
                        this.props.changeValue(k, e.target.checked)
                    }}/>
                default:
                    return <input type={'number'} value={v} onChange={(e) => {
                        e.preventDefault()
                        this.props.changeValue(k, parseInt(e.target.value))
                    }}/>
            }
        }

        const single = (k, v) => {

            return(
                <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: "5%", marginBottom: "5%"}}>
                        <div>{k}</div>
                        {getInput(k, v)}
                    </div>
                    <hr />
                </div>

            )
        }

        const keys = Object.keys(this.props.settings)

        return (
            <div>
                <div>
                    <hr />
                    <div style={customStyles}>
                        {keys.map(key => single(key, this.props.settings[key]))}
                    </div>
                </div>
                <div style={{marginTop: 'auto', marginLeft: 'auto', marginRight: 'auto'}}>
                    <button style={{marginTop: 'auto', marginLeft: 'auto', marginRight: 'auto'}} onClick={() => this.props.reqReload()}>click to reload</button>
                </div>
            </div>

        );
    }
}

export default Settings;