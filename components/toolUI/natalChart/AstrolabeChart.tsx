"use client";

import React from "react";
import { Iztrolabe } from "react-iztro";
import type { IztrolabeProps } from "react-iztro/lib/Iztrolabe/Iztrolabe.type";
import "./custom-iztro.css";

export default function AstrolabeChart(props: IztrolabeProps) {
    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <Iztrolabe {...props} />
        </div>
    );
}