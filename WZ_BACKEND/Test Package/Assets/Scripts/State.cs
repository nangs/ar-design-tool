﻿using UnityEngine;
using System.Collections.Generic;
using System.Collections;

public class State : MonoBehaviour {

    public List<GameObject> stateObjects;
    public int id;
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {

	}

#if UNITY_EDITOR
    public void SetUp(SerialState s)
    {
        stateObjects = new List<GameObject>();
        name = s.name;
        id = s.id;
        foreach (SerialStateObject sso in s.stateObjects)
        {
            GameObject currentStateObjectGO = FileLoader.loadPrefab(sso.modelName);
            currentStateObjectGO = Instantiate(currentStateObjectGO);
            StateObject currentStateObject = currentStateObjectGO.AddComponent<StateObject>();
            currentStateObjectGO.transform.SetParent(transform);
            currentStateObject.SetUp(sso);
            stateObjects.Add(currentStateObjectGO);
        }
    }
#endif
}
