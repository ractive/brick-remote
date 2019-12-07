import {Icon, Modal} from "antd";
import React, {useState} from "react";
import Help from "./Help";

const HelpModal = () => {
    const [visible, setVisible] = useState(false);

    function toggleVisibility() {
        setVisible((v) => !v);
    }

    return (
        <>
            <Icon type="question-circle" onClick={toggleVisibility} />
            <Modal
                width="90%"
                visible={visible}
                cancelButtonProps={{ hidden: true }}
                onOk={toggleVisibility}
                onCancel={toggleVisibility}
                keyboard={true}
            >
                <Help/>
            </Modal>
        </>
    );
};

export default HelpModal;
