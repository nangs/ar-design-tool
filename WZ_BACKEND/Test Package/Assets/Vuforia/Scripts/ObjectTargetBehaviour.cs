/*==============================================================================
Copyright (c) 2010-2014 Qualcomm Connected Experiences, Inc.
All Rights Reserved.
Confidential and Proprietary - Qualcomm Connected Experiences, Inc.
==============================================================================*/

using System.Collections.Generic;
using UnityEngine;

namespace Vuforia
{
    /// <summary>
    /// This class serves both as an augmentation definition for an ObjectTarget in the editor
    /// as well as a tracked object target result at runtime
    /// </summary>
    public class ObjectTargetBehaviour : ObjectTargetAbstractBehaviour
    {
        internal void ChangeImageTarget(string dataset, string trackerName)
        {
            base.mDataSetPath = dataset;
            base.mTrackableName = trackerName;
        }
    }
}
