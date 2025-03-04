import styled from "styled-components";
import React, { createContext, useContext, useState } from "react";

// Create a context for the tooltip
const TooltipContext = createContext();

// TooltipProvider component
export const TooltipProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </TooltipContext.Provider>
  );
};

// TooltipWrapper component
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

// TooltipText component (Fixed positioning issues)
const TooltipText = styled.span`
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  position: absolute;
  background: #333;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform: ${({ isOpen }) => (isOpen ? "scale(1)" : "scale(0.95)")};
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  font-family: "Inter", sans-serif;
  margin: 0;
  line-height: normal;

  /* Adjust positioning */
  ${({ position }) =>
    position === "top" &&
    `bottom: 110%; left: 50%; transform: translateX(-50%) scale(${({
      isOpen,
    }) => (isOpen ? 1 : 0.95)});`}
  ${({ position }) =>
    position === "bottom" &&
    `top: 110%; left: 50%; transform: translateX(-50%) scale(${({ isOpen }) =>
      isOpen ? 1 : 0.95});`}
  ${({ position }) =>
    position === "left" &&
    `top: 50%; right: 110%; transform: translateY(-50%) scale(${({ isOpen }) =>
      isOpen ? 1 : 0.95});`}
  ${({ position }) =>
    position === "right" &&
    `top: 50%; left: 110%; transform: translateY(-50%) scale(${({ isOpen }) =>
      isOpen ? 1 : 0.95});`}

  &:after {
    content: "";
    position: absolute;
    border-style: solid;
    border-width: 6px;
    border-color: transparent;
  }

  ${({ position }) =>
    position === "top" &&
    `&:after { top: 100%; left: 50%; transform: translateX(-50%); border-top-color: #333; }`}
  ${({ position }) =>
    position === "bottom" &&
    `&:after { bottom: 100%; left: 50%; transform: translateX(-50%); border-bottom-color: #333; }`}
  ${({ position }) =>
    position === "left" &&
    `&:after { left: 100%; top: 50%; transform: translateY(-50%); border-left-color: #333; }`}
  ${({ position }) =>
    position === "right" &&
    `&:after { right: 100%; top: 50%; transform: translateY(-50%); border-right-color: #333; }`}
`;

// Tooltip component (Ensuring correct positioning)
export const Tooltip = ({ children, position = "bottom" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      <TooltipWrapper
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </TooltipWrapper>
    </TooltipContext.Provider>
  );
};

// TooltipTrigger component
export const TooltipTrigger = ({ children, asChild }) => {
  return asChild ? children : <div>{children}</div>;
};

// TooltipContent component
export const TooltipContent = ({ children, className }) => {
  const { isOpen } = useContext(TooltipContext);

  return (
    <TooltipText isOpen={isOpen} className={className}>
      {children}
    </TooltipText>
  );
};
