﻿using UnityEngine;
using System.Collections;

public class StateObject{
    
    public GameObject gameObject;
    public GameObject button;
    public StateObjectChanger stateObjectChanger;
    public string instanceName;
    public int id;
    public bool isStateChanger;
    public int transitionStateId;
    public StateObjectType type;

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

    public void SetPreview()
    {
        Transformable t = gameObject.GetComponent<Transformable>();
        t.SetPreview();
        Preview p = gameObject.GetComponent<Preview>();
        p.SetPreview(transitionStateId, isStateChanger);
    }

    public void DisablePreview()
    {
        Transformable t = gameObject.GetComponent<Transformable>();
        t.DisablePreview();
    }


    public void SetName(string newName)
    {
        instanceName = newName;
    }

    public void RemoveLink(int stateId)
    {
        if (isStateChanger && transitionStateId == stateId)
        {
            UnSetTransition();
        }
    }

    public void UnSetTransition()
    {
        isStateChanger = false;
        stateObjectChanger.UnSetIsStateChanger();
    }

    public void SetTransition(int transitionStateId)
    {
        isStateChanger = true;
        this.transitionStateId = transitionStateId;
    }
}


