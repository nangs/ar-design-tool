﻿using UnityEngine;
using System.Collections;

public class StateObject{
    
    public GameObject gameObject;
    public GameObject button;
    public string instanceName;
    public bool isStateChanger;
    public int transitionStateId;

    public StateObject(GameObject g)
    {
        gameObject = g;
        instanceName = g.name;
    }

    public void Hide()
    {
        gameObject.SetActive(false);
        button.SetActive(false);
    }

    public void Show()
    {
        gameObject.SetActive(true);
        button.SetActive(true);
    }

    public void Destroy()
    {
        gameObject.GetComponent<Transformable>().destroyElements();
        MonoBehaviour.Destroy(button);
        MonoBehaviour.Destroy(gameObject);
    }

}
