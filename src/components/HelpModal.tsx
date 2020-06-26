import { Modal } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import Help from "./Help";

const HelpModal: React.FC = () => {
  const [visible, setVisible] = useState(false);

  function toggleVisibility() {
    setVisible((v) => !v);
  }

  return (
    <>
      <QuestionCircleOutlined onClick={toggleVisibility} />
      <Modal
        width="90%"
        visible={visible}
        cancelButtonProps={{ hidden: true }}
        onOk={toggleVisibility}
        onCancel={toggleVisibility}
        keyboard={true}
      >
        <Help />
      </Modal>
    </>
  );
};

export default HelpModal;
