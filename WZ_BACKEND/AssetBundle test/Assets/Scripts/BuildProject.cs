﻿#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using System.Collections;
using System.Collections.Generic;
using System.Threading;
using System.IO;
using Vuforia;


public class BuildProject : MonoBehaviour {
    const string DEFAULT_SCENE_NAME = "Assets/Scenes/main.unity";
    const string VUFORIA_PACKAGE_PATH = "/Resources/Vuforia/marker.unitypackage";
    const string AR_CAMERA_PREFAB_NAME = "ARCamera";
    const string IMAGE_TARGET_PREFAB_NAME = "ImageTarget";
    const string OBJECT_TARGET_PREFAB_NAME = "ObjectTarget";
    const string APK_PATH = "/AndroidBuilds.apk";
    const string IMAGE_DATASET_PATH = "/Editor/QCAR/ImageTargetTextures";
    const string OBJECT_DATASET_PATH = "/Editor/QCAR/TargetSetData";
    const string MODELS_DATA_PATH = "/Resources/Obj";

    const int INVALID_PACKAGE_ERROR_CODE = 2;

    enum MarkerType {IMAGE, OBJECT};
    
    private static GameObject marker2d;
    private static GameObject marker3d;
    private static GameObject ARCamera;
    private static List<GameObject> userGameObjects = new List<GameObject>();
    private static string[] levels = { DEFAULT_SCENE_NAME };

    static void PlaceObjects(List<string> objNames,GameObject marker)
    {
        foreach (string objName in objNames)
        {
            GameObject go = Instantiate(FileLoader.loadOBJ(objName)) as GameObject;
            go.transform.SetParent(marker.transform,false);
            userGameObjects.Add(go);
        }
    }

    public static void SetUpStates(GameObject marker)
    {
        List<SerialState> states = LoadState.Load(); 
        List<string> modelNames = new List<string>();
      
        Scene currentScene =  EditorSceneManager.GetActiveScene();
        GameObject stateManagerGO = new GameObject();
        stateManagerGO.name = "State Manager";
        AppStateManager stateManager = stateManagerGO.AddComponent<AppStateManager>();
        stateManager.SetUp(states,marker);
        //PlaceObjects(modelNames, marker);
        EditorSceneManager.SaveScene(currentScene, DEFAULT_SCENE_NAME, false);

    }

    private static string[] ReadDataSetTrackerName(MarkerType markerType)
    {
        string[] result = new string[2];
        string datasetPath;
        if (markerType == MarkerType.IMAGE)
        {
            datasetPath = IMAGE_DATASET_PATH;
        }
        else
        {
            datasetPath = OBJECT_DATASET_PATH;
        }

        //Get DataSet name
        string[] tempArray = Directory.GetDirectories(Application.dataPath + datasetPath );
        
        if (tempArray.Length == 0)
        {
            EditorApplication.Exit(INVALID_PACKAGE_ERROR_CODE);
        }

        result[0] = Path.GetFileName(tempArray[0]);
        string temp = tempArray[0];
        

        //Get target Name
        tempArray = Directory.GetFiles(temp);
        if (tempArray.Length == 0)
        {
            EditorApplication.Exit(INVALID_PACKAGE_ERROR_CODE);
        }
        temp = Path.GetFileNameWithoutExtension(tempArray[0]);
        
      
        if (temp.Substring(temp.Length - 7, 7).Equals("_scaled"))
        {
            temp = temp.Substring(0, temp.Length-7);
        }

        result[1] = temp;

        return result;
    }

    [MenuItem("File/Setup vuforia")]
    private static void SetupVuforiaTools(MarkerType markerType)
    {
        Scene currentScene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene);
        ARCamera = Instantiate(FileLoader.LoadVuforia(AR_CAMERA_PREFAB_NAME));
        string[] dataSetTrackerName = ReadDataSetTrackerName(markerType);
        Vuforia.DatabaseLoadBehaviour vuforiaTrackerPackage = ARCamera.GetComponent<Vuforia.DatabaseLoadBehaviour>();
        vuforiaTrackerPackage.SetupDataSets(dataSetTrackerName[0]);
        if(markerType == MarkerType.IMAGE){
            marker2d = Instantiate(FileLoader.LoadVuforia(IMAGE_TARGET_PREFAB_NAME));
            Vuforia.ImageTargetBehaviour imageTargetBehaviour = marker2d.GetComponent<Vuforia.ImageTargetBehaviour>();
            imageTargetBehaviour.ChangeImageTarget(dataSetTrackerName[0],dataSetTrackerName[1]);
        }
        else{
            marker3d = Instantiate(FileLoader.LoadVuforia(OBJECT_TARGET_PREFAB_NAME));
            Vuforia.ObjectTargetBehaviour objectTargetBehavior = marker3d.GetComponent<Vuforia.ObjectTargetBehaviour>();
            objectTargetBehavior.ChangeImageTarget(dataSetTrackerName[0], dataSetTrackerName[1]);
        }
 
       
    }

    [MenuItem("File/ImportPackage")]
    public static void ImportPackage()
    {
        AssetDatabase.ImportPackage(Application.dataPath + VUFORIA_PACKAGE_PATH, false);
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh(ImportAssetOptions.ForceUpdate);
    }

    [MenuItem("File/Build Android 2D")]
    public static void BuildAndroid2D()
    {
        SetupVuforiaTools(MarkerType.IMAGE);
        SetUpStates(marker2d);
        BuildPipeline.BuildPlayer(levels, Application.dataPath + APK_PATH, BuildTarget.Android, BuildOptions.None);
        //CleanProject();
       
        
    }

      [MenuItem("File/Build Android 3D")]
    static void BuildAndroid3D()
    {
        
        SetupVuforiaTools(MarkerType.OBJECT);
        SetUpStates(marker3d);
        BuildPipeline.BuildPlayer(levels, Application.dataPath + APK_PATH, BuildTarget.Android, BuildOptions.None);
    }

      [MenuItem("File/Build IOS 2D")]
    static void BuildIOS2D()
    {
        
        SetupVuforiaTools(MarkerType.IMAGE);
        SetUpStates(marker2d);
        BuildPipeline.BuildPlayer(levels, Application.dataPath + APK_PATH, BuildTarget.iOS, BuildOptions.None);
        
    }

     [MenuItem("File/Build IOS 3D")]
    static void BuildIOS3D()
    {
        
        SetupVuforiaTools(MarkerType.OBJECT);
        SetUpStates(marker3d);
        BuildPipeline.BuildPlayer(levels, Application.dataPath + APK_PATH, BuildTarget.iOS, BuildOptions.None);
        
    }

    [MenuItem("Assets/Uninstall Previous")]
     static void CleanProject()
     {
        bool status = AssetDatabase.DeleteAsset("Assets/Editor/QCAR");
        status = AssetDatabase.DeleteAsset("Assets/StreamingAssets");
     }
}
#endif