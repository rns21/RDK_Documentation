# How to Refresh the Patches

## Overview

Sometimes while applying patches, it may face offsets mismatch and results in failure. This makes your build verification also to fail.
You can get similar error in console logs for patch failures.

```bash
ERROR: Command Error: exit status: 1 Output:  
Applying patch index.patch  
patching file source/Styles/xb3/code/index.php  
Hunk \#1 succeeded at 22 (offset 21 lines).  
Hunk \#2 succeeded at 32 (offset 21 lines).  
Hunk \#3 succeeded at 73 (offset 21 lines).  
Hunk \#4 succeeded at 183 (offset 27 lines).  
Hunk \#5 succeeded at 195 (offset 27 lines).  
Hunk \#6 succeeded at 245 (offset 37 lines).  
Hunk \#7 succeeded at 307 (offset 37 lines).  
Hunk \#8 succeeded at 460 (offset 52 lines).  
Hunk \#9 succeeded at 469 (offset 52 lines).  
Hunk \#10 FAILED at 431.  
Hunk \#11 FAILED at 445.  
Hunk \#12 FAILED at 455.  
3 out of 12 hunks FAILED -- rejects in file source/Styles/xb3/code/index.php  
Patch index.patch does not apply (enforce with -f)
```
From the logs, you can find out that patch is not applied to the source file properly. In such scenarios you will have to update or refersh the patch.

### Step 1 : Get the patch file

1.Find the repo for the patch file.(For ex : here the patch file is index.patch.)

2.Clone the repo. For ex:
```bash
$ mkdir patch
$ cd patch/
$ git clone ssh://rkumar840@gerrit.teamccp.com:29418/rdk/yocto_oe/layers/meta-rdk-oem-pace-broadcom
```
3.Checkout the branch for which you want to create the patch.

```
$ git checkout 1905_sprint
$ git branch
```
4.Find the location of the patch file in the repo.

```bash
$ find . -iname index.patch
./meta-pacexf3/recipes-ccsp/ccsp/ccsp-webui/index.patch
```
### Step 2 : Identify the component repo

1. Next find the repo for the actual source file to which the patch file was getting patched. ( For ex: here the source file is index.php)

2. clone the repo
Example:
```bash
$ mkdir source
$ cd source/
$ git clone ssh://rkumar840@gerrit.teamccp.com:29418/rdk/rdkb/components/opensource/ccsp/webui/generic
```
3.checkout the required branch

```bash
$ git checkout 1905_sprint
$ git branch
```
4.Cherry-pick the required changes also
```bash
$ git fetch ssh://rkumar840@gerrit.teamccp.com:29418/rdk/rdkb/components/opensource/ccsp/webui/generic
```
5.After cherry-picking you can verify the changes in the source file.

### Step 3 : Apply the patches

1\.
create another directory, and clone the source code repo (as in step 2). For ex :

-   $ mkdir dummy
-   $ cd dummy/
-   $ git  clone 
    [ssh://rkumar840@gerrit.teamccp.com:29418/rdk/rdkb/components/opensource/ccsp/webui/generi](ssh://rkumar840@gerrit.teamccp.com:29418/rdk/rdkb/components/opensource/ccsp/webui/generic)
    c

2.checkout the required branch

-   $ git checkout 1905_sprint
-   $ git branch

3.Copy the patch file from the patch repo (step 1) to the current directory.

-   $ cp ../patch/meta-pacexf3/recipes-ccsp/ccsp/ccsp-webui/index.patch .
-   $ ls

           
[cmpnt_build_custom_pre_arm.mk](http://cmpnt_build_custom_pre_arm.mk/)
   
[CONTRIBUTING.md](http://contributing.md/)
       debug_scripts      LICENSE         NOTICE         scripts  
[           cmpnt_build_custom_pre_pc.mk](http://cmpnt_build_custom_pre_pc.mk/)
           COPYING                     
 
 
 
index.patch 
 
 
 
      Makefile.orig     README       source

4.Apply the patch to the source file/files.

-   $ patch -p1 &lt; index.patchpatching file source/Styles/xb3/code/index.php  
    Hunk \#1 succeeded at 22 (offset 21 lines).  
    Hunk \#2 succeeded at 32 (offset 21 lines).  
    Hunk \#3 succeeded at 73 (offset 21 lines).  
    Hunk \#4 succeeded at 183 (offset 27 lines).  
    Hunk \#5 succeeded at 195 (offset 27 lines).  
    Hunk \#6 succeeded at 245 (offset 37 lines).  
    Hunk \#7 succeeded at 307 (offset 37 lines).  
    Hunk \#8 succeeded at 445 (offset 37 lines).  
    Hunk \#9 succeeded at 454 (offset 37 lines).  
    Hunk \#10 succeeded at 468 (offset 37 lines).  
    Hunk \#11 succeeded at 482 (offset 37 lines).  
    Hunk \#12 succeeded at 492 (offset 37 lines).

5.It should be applied successfully. In case of observing any failure when apply the patch to the source file/files then skip this step. If no failures observed then take a backup for the file/files got patched. For ex : 

-   $ cp source/Styles/xb3/code/index.php source/Styles/xb3/code/index_bk.php

6.In case of observing any failure when apply the patch to the source file/files, then this may expects some other patch to be applied first. In such case,

-   Find the repo init command from the full console log. Search for "Repo Init". 

            Example: Repo Init for - Project:
[&lt;](ssh://gerrit.teamccp.com:29418/rdk/yocto_oe/manifests/cisco-intel-manifest)
clone_url&gt; Branch: 2003_sprint Manifest: ciscoxb3-3939B

-   Create another directory

            $ mkdir cisco_intel_repo

            $ cd cisco_intel_repo

-   Append .xml with manifest filename in repo init command and Clone the repo

          $ repo init -u
[&lt;](ssh://gerrit.teamccp.com:29418/rdk/yocto_oe/manifests/cisco-intel-manifest)
clone_url&gt; -m ciscoxb3-3939B.xml -b 2003_sprint

          $ repo sync -j4 --no-clone-bundle

-   grep with file name( in which patch applied failure observed) in meta-\* layers, So that will find the other patch file which creates this file.

           $ grep -irn "Filename" meta-\*          

-   Analyse and apply the patch file first, and then on top of that apply the second patch file, If no failures observed then take a backup for the file/files got patched. For ex : 

           $ cp source/Styles/xb3/code/index.php source/Styles/xb3/code/index_bk.php      

### Step 4 : Compare the files and generate patch

1.Now you can use "Meld tool" to compare between files to refresh the patch. Here you can compare between the source file generated in step 2 (which will have the required changes) and the source file generated in step-3 (which will have the patch appied on to it).

2.During comparing between source files make sure that you take only the required changes (changes available in actual source file step-2) to the patched file generated in step-3.

3.Once all changes are taken , you can verify the patch by checking the option file/format as patch in the tool. Save the updated file and copy it to your repo (repo generated in step-2)

4.Now in your repo , you will have 2 source file (for ex: one will be index.php --original file with the required changes and index_bk.php --updated file with patch applied and also your changes).

5.In terminal , you can use command "diff -ruN  file1 file2 &gt; new_patch_file.patch" to generate a  new patch.

6.For ex :
**diff -ruN index.php index_bk.php &gt; new_index.patch**

7.In case patch file has more than one file, then append the difference using
**diff -ruN next_file nextfile_bk.php &gt;&gt; new_index.patch**

### Step 5 : Update the patch file

1\.
Open the newly created patch file, update the file location correctly and save it. For ex :

---
**git/source/Styles/xb3/code/index.php**
2019-05-20 05:56:54.047078876 +0000  
+++
**git.1/source/Styles/xb3/code/index.php**
2019-05-20 06:26:56.000000000 +0000

### Step 6 : Validate the patch file

1.In order to verify the newly created patch, you can create a temporary folder, clone the repo, checkout the required branch. Now copy the latest patch (new_index.patch) here. 

2.In the terminal, give the command 
**patch -p1 &lt;  new_index.patch**
, will apply the patch to the source file. It should not fail.

### step 7 : Push the changes

1.Now for pushing the latest patch, clone the repo for patch (step-1)

-   $ mkdir push
-   $ cd push/
-   $ git clone 
    [ssh://rkumar840@gerrit.teamccp.com:29418/rdk/yocto_oe/layers/meta-rdk-oem-pace-broadcom](ssh://rkumar840@gerrit.teamccp.com:29418/rdk/yocto_oe/layers/meta-rdk-oem-pace-broadcom)
     .

2.checkout the required branch.

-   $ git checkout 1905_sprint

3.copy the latest patch(new_index.patch in this case) to the actual patch file available in the repo.

-   $ cp ../src/new_index.patch meta-pacexf3/recipes-ccsp/ccsp/ccsp-webui/index.patch
-   $ git status

4.It will show the file as modified. Perform git add.

-   $ git add meta-pacexf3/recipes-ccsp/ccsp/ccsp-webui/index.patch
-   $ git commit

5.Update if any commit message has to be added and try to push the changes.

-   $ git push origin HEAD:refs/for/1905_sprint

6.It fails for commit message upload. For ex : you may get error like this :

-   remote: ERROR: [6b429fb] missing Change-Id in commit message footer
-   remote:
-   remote: Hint: To automatically insert Change-Id, install the hook:
-   remote:
    **gitdir=$(git rev-parse --git-dir); scp -p -P 29418
    rkumar840
    [@gerrit.teamccp.com](mailto:lpurus394@gerrit.teamccp.com)
    :hooks/commit-msg $&#123;gitdir&#125;/hooks/**
-   remote: And then amend the commit:
-   remote: git commit --amend

7.Run the command mention in logs.

-   $ gitdir=$(git rev-parse --git-dir); scp -p -P 29418 
    rkumar840
    [@gerrit.teamccp.com](mailto:lpurus394@gerrit.teamccp.com)
    :hooks/commit-msg $&#123;gitdir&#125;/hooks/
-   $ git commit --amend (No change-id is assigned to the change.)
-   $ git commit --amend  (change-id has assigned now.)
-   $ git push origin HEAD:refs/for/1905_sprint

8.This will push the changes successfully to the branch. You can open the gerrit link and verify.

9.Put the same topic name for the patch and the source file , trigger the verification.

