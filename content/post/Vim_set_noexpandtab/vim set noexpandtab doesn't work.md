# vim set noexpandtab doesn't work

Recently i was writing some python code, i always encounter this error:

![image-20220728120446489](/home/hacksang/.config/Typora/typora-user-images/image-20220728120446489.png)

And what confuses me is that i have use ```set noexpandtab``` command in ```~/.vimrc```, but it doesn't work. Today i cannot stand it anymore, so i search it and find that [answer](https://vi.stackexchange.com/questions/13537/why-is-set-noexpandtab-in-my-vimrc-ignored-when-i-open-a-file/13538#13538?newreg=0e319cf574ca4183b1303c18a3ae8fac). It seems like python plugin overwrite my setting.

## Solution

1. use ```:verbose set noexpandtab?``` to find the pulgin file

   ![image-20220728120914214](/home/hacksang/.config/Typora/typora-user-images/image-20220728120914214.png)

2. search expandtab in that file

   ![image-20220728121003564](/home/hacksang/.config/Typora/typora-user-images/image-20220728121003564.png)

3. change it to noexpandtab

   