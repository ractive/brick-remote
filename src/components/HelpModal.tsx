import { Modal } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import Help from "./Help";

const HelpModal = () => {
  const [open, setOpen] = useState(false);

  function toggleVisibility() {
    setOpen((v) => !v);
  }

  return (
    <>
      <QuestionCircleOutlined aria-label="Help" onClick={toggleVisibility} />
      <Modal
        width="90%"
        open={open}
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
